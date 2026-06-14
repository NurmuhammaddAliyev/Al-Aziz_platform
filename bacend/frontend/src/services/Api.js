const API_BASE = 'http://127.0.0.1:8000';

const getTokens = () => {
  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  return { access, refresh };
};

const saveTokens = (access, refresh) => {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

async function refreshToken() {
  const { refresh } = getTokens();
  if (!refresh) {
    clearTokens();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      saveTokens(data.access, data.refresh);
      return data.access;
    }
  } catch (err) {
    console.error('Error refreshing token:', err);
  }

  clearTokens();
  return null;
}

async function apiRequest(endpoint, options = {}) {
  let { access } = getTokens();
  
  options.headers = {
    ...options.headers,
  };

  // If request body is not FormData, set Content-Type header
  if (!(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }

  if (access) {
    options.headers['Authorization'] = `Bearer ${access}`;
  }

  let res = await fetch(`${API_BASE}${endpoint}`, options);

  // If unauthorized, try to refresh token
  if (res.status === 401) {
    const newAccess = await refreshToken();
    if (newAccess) {
      options.headers['Authorization'] = `Bearer ${newAccess}`;
      res = await fetch(`${API_BASE}${endpoint}`, options);
    } else {
      // Trigger user logout event/reload if token refresh fails
      window.dispatchEvent(new Event('auth-logout'));
    }
  }

  if (res.status === 204) {
    return true;
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let errMsg = errData.detail || errData.message;
    if (!errMsg && errData && typeof errData === 'object') {
      const values = Object.values(errData);
      if (values.length > 0) {
        const firstVal = values[0];
        errMsg = Array.isArray(firstVal) ? firstVal[0] : (typeof firstVal === 'string' ? firstVal : JSON.stringify(firstVal));
      }
    }
    const error = new Error(errMsg || 'API Request failed');
    error.status = res.status;
    error.data = errData;
    throw error;
  }

  if (options.responseType === 'blob') {
    return res.blob();
  }

  if (options.responseType === 'text') {
    return res.text();
  }

  return res.json();
}

export const Api = {
  auth: {
    login: async (username, password) => {
      const data = await apiRequest('/api/auth/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      saveTokens(data.access, data.refresh);
      // Fetch user profile immediately
      return Api.auth.me();
    },
    register: async (userData) => {
      const data = await apiRequest('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      saveTokens(data.access, data.refresh);
      return data.user;
    },
    me: () => apiRequest('/api/auth/me/'),
    updateMe: (formData) => {
      // Use FormData directly for profile picture upload if needed
      return apiRequest('/api/auth/me/', {
        method: 'PATCH',
        body: formData instanceof FormData ? formData : JSON.stringify(formData),
      });
    }
  },
  
  students: {
    list: () => apiRequest('/api/students/'),
    get: (id) => apiRequest(`/api/students/${id}/`),
    create: (studentData) => {
      let body;
      let headers = {};
      
      if (studentData instanceof FormData) {
        body = studentData;
      } else {
        body = JSON.stringify(studentData);
      }
      
      return apiRequest('/api/students/', {
        method: 'POST',
        body,
        headers
      });
    },
    update: (id, studentData) => {
      let body;
      if (studentData instanceof FormData) {
        body = studentData;
      } else {
        body = JSON.stringify(studentData);
      }
      return apiRequest(`/api/students/${id}/`, {
        method: 'PATCH',
        body,
      });
    },
    delete: (id) => apiRequest(`/api/students/${id}/`, {
      method: 'DELETE',
    })
  },

  classGroups: {
    list: () => apiRequest('/api/class-groups/'),
    create: (groupData) => apiRequest('/api/class-groups/', {
      method: 'POST',
      body: JSON.stringify(groupData),
    }),
    update: (id, groupData) => apiRequest(`/api/class-groups/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(groupData),
    }),
    delete: (id) => apiRequest(`/api/class-groups/${id}/`, {
      method: 'DELETE',
    })
  },

  enrollments: {
    list: () => apiRequest('/api/enrollments/'),
    create: (enrollmentData) => apiRequest('/api/enrollments/', {
      method: 'POST',
      body: JSON.stringify(enrollmentData),
    }),
    update: (id, enrollmentData) => apiRequest(`/api/enrollments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(enrollmentData),
    }),
    delete: (id) => apiRequest(`/api/enrollments/${id}/`, {
      method: 'DELETE',
    })
  },

  subjects: {
    list: () => apiRequest('/api/subjects/'),
    create: (subjectData) => apiRequest('/api/subjects/', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    }),
    update: (id, subjectData) => apiRequest(`/api/subjects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(subjectData),
    }),
    delete: (id) => apiRequest(`/api/subjects/${id}/`, {
      method: 'DELETE',
    })
  },

  attendance: {
    list: () => apiRequest('/api/attendance/'),
    create: (attendanceData) => apiRequest('/api/attendance/', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    }),
    update: (id, attendanceData) => apiRequest(`/api/attendance/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(attendanceData),
    }),
    delete: (id) => apiRequest(`/api/attendance/${id}/`, {
      method: 'DELETE',
    })
  },

  grades: {
    list: () => apiRequest('/api/grades/'),
    create: (gradeData) => apiRequest('/api/grades/', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    }),
    update: (id, gradeData) => apiRequest(`/api/grades/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(gradeData),
    }),
    delete: (id) => apiRequest(`/api/grades/${id}/`, {
      method: 'DELETE',
    })
  },

  schedule: {
    list: () => apiRequest('/api/schedule/'),
    create: (scheduleData) => apiRequest('/api/schedule/', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    }),
    update: (id, scheduleData) => apiRequest(`/api/schedule/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(scheduleData),
    }),
    delete: (id) => apiRequest(`/api/schedule/${id}/`, {
      method: 'DELETE',
    })
  },

  reports: {
    dashboard: () => apiRequest('/api/reports/dashboard/'),
    absenceAlerts: () => apiRequest('/api/reports/absence-alerts/'),
    classSummary: () => apiRequest('/api/reports/class-summary/'),
    downloadAttendance: () => apiRequest('/api/reports/export/attendance/', { responseType: 'blob' }),
    downloadGrades: () => apiRequest('/api/reports/export/grades/', { responseType: 'blob' }),
  }
};
