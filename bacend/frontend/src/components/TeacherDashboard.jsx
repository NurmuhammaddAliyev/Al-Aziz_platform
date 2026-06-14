import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Calendar, CheckCircle, Award, AlertTriangle,
  Trash2, Edit, Plus, Check, X, ClipboardList, Clock, ShieldAlert, AlertCircle
} from 'lucide-react';
import { Api } from '../services/Api';

export default function TeacherDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [classSummary, setClassSummary] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentView, setEnrollmentView] = useState('pending');
  const [enrollmentBusyId, setEnrollmentBusyId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        Api.reports.dashboard(),
        Api.reports.absenceAlerts(),
        Api.students.list(),
        Api.subjects.list(),
        Api.schedule.list(),
        Api.grades.list(),
        Api.attendance.list(),
        Api.reports.classSummary(),
        Api.enrollments.list(),
      ]);

      const [
        statsRes,
        alertsRes,
        studentsRes,
        subjectsRes,
        scheduleRes,
        gradesRes,
        attendanceRes,
        classSummaryRes,
        enrollmentsRes,
      ] = results;

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.alerts || []);
      // Extract paginated responses: {count, next, previous, results: [...]}
      if (studentsRes.status === 'fulfilled') {
        const studentsData = Array.isArray(studentsRes.value) ? studentsRes.value : (studentsRes.value?.results || []);
        setStudents(studentsData);
      }
      if (subjectsRes.status === 'fulfilled') {
        const subjectsData = Array.isArray(subjectsRes.value) ? subjectsRes.value : (subjectsRes.value?.results || []);
        setSubjects(subjectsData);
      }
      if (scheduleRes.status === 'fulfilled') {
        const scheduleData = Array.isArray(scheduleRes.value) ? scheduleRes.value : (scheduleRes.value?.results || []);
        setSchedules(scheduleData);
      }
      if (gradesRes.status === 'fulfilled') {
        const gradesData = Array.isArray(gradesRes.value) ? gradesRes.value : (gradesRes.value?.results || []);
        setGrades(gradesData);
      }
      if (attendanceRes.status === 'fulfilled') {
        const attendanceData = Array.isArray(attendanceRes.value) ? attendanceRes.value : (attendanceRes.value?.results || []);
        setAttendanceRecords(attendanceData);
      }
      if (classSummaryRes.status === 'fulfilled') setClassSummary(classSummaryRes.value.items || []);
      if (enrollmentsRes.status === 'fulfilled') {
        const enrollmentsData = Array.isArray(enrollmentsRes.value) ? enrollmentsRes.value : (enrollmentsRes.value?.results || []);
        setEnrollments(enrollmentsData || []);
      }

      const failures = results.filter(item => item.status === 'rejected');
      if (failures.length === results.length) {
        showMsg('Tizim ma\'lumotlarini yuklashda xatolik yuz berdi.', 'error');
      } else if (failures.length > 0) {
        console.warn('Some dashboard requests failed:', failures);
      }
    } catch (err) {
      console.error('Error loading admin stats:', err);
      showMsg('Tizim ma\'lumotlarini yuklashda xatolik yuz berdi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Loaders
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Student CRUD State & Actions
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    username: '', password: '', first_name: '', last_name: '', email: '', phone: '', class_name: ''
  });
  const [editingStudent, setEditingStudent] = useState(null);

  const handleStudentCreate = async (e) => {
    e.preventDefault();
    try {
      await Api.students.create(studentForm);
      showMsg('Yangi o\'quvchi muvaffaqiyatli qo\'shildi!');
      setShowAddStudent(false);
      setStudentForm({ username: '', password: '', first_name: '', last_name: '', email: '', phone: '', class_name: '' });
      loadDashboardData();
    } catch (err) {
      showMsg(err.message || 'O\'quvchi qo\'shishda xatolik yuz berdi.', 'error');
    }
  };

  const handleStudentUpdate = async (e) => {
    e.preventDefault();
    try {
      await Api.students.update(editingStudent.id, {
        class_name: editingStudent.class_name,
        phone: editingStudent.phone,
        is_active: editingStudent.is_active
      });
      showMsg('O\'quvchi ma\'lumotlari yangilandi!');
      setEditingStudent(null);
      loadDashboardData();
    } catch (err) {
      showMsg('Tahrirlashda xatolik yuz berdi.', 'error');
    }
  };

  const handleStudentDelete = async (id) => {
    if (!window.confirm('Haqiqatan ham bu o\'quvchini o\'chirmoqchisiz? Barcha dars yozuvlari va baholari o\'chib ketadi.')) return;
    try {
      await Api.students.delete(id);
      showMsg('O\'quvchi o\'chirildi.');
      loadDashboardData();
    } catch (err) {
      showMsg('O\'chirishda xatolik yuz berdi.', 'error');
    }
  };

  // Attendance Logging State & Actions
  const [attClass, setAttClass] = useState('');
  const [attSubject, setAttSubject] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [classStudents, setClassStudents] = useState([]);
  const [attStatuses, setAttStatuses] = useState({}); // studentId -> { status, note }

  const handleFetchClassStudents = () => {
    if (!attClass) return;
    const filtered = students.filter(s => (s.class_group?.name || s.class_name) === attClass && s.is_active);
    setClassStudents(filtered);

    // Initialize default attendance states
    const initStatuses = {};
    filtered.forEach(s => {
      initStatuses[s.id] = { status: 'present', note: '' };
    });
    setAttStatuses(initStatuses);
  };

  const handleAttendanceChange = (studentId, field, val) => {
    setAttStatuses({
      ...attStatuses,
      [studentId]: {
        ...attStatuses[studentId],
        [field]: val
      }
    });
  };

  const handleSaveAttendance = async () => {
    if (!attSubject) {
      showMsg('Iltimos, fanni tanlang!', 'error');
      return;
    }
    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    try {
      for (const [studentId, attData] of Object.entries(attStatuses)) {
        try {
          await Api.attendance.create({
            student: parseInt(studentId),
            date: attDate,
            status: attData.status,
            note: attData.note
          });
          successCount++;
        } catch (err) {
          // If record exists, update it or count as fail
          failCount++;
        }
      }
      showMsg(`Davomat saqlandi: ${successCount} ta kiritildi, ${failCount} ta xatolik (allaqachon kiritilgan bo'lishi mumkin).`);
      loadDashboardData();
    } catch (err) {
      showMsg('Davomat saqlashda xatolik.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Grade Logging State & Actions
  const [gradeForm, setGradeForm] = useState({
    student: '', subject: '', score: '', scale: 'five', date: new Date().toISOString().split('T')[0], note: ''
  });

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await Api.grades.create({
        student: parseInt(gradeForm.student),
        subject: parseInt(gradeForm.subject),
        score: parseFloat(gradeForm.score),
        scale: gradeForm.scale,
        date: gradeForm.date,
        note: gradeForm.note
      });
      showMsg('Baho muvaffaqiyatli kiritildi!');
      setGradeForm({
        student: '', subject: '', score: '', scale: 'five', date: new Date().toISOString().split('T')[0], note: ''
      });
      loadDashboardData();
    } catch (err) {
      showMsg(err.message || 'Baho kiritishda xatolik yuz berdi.', 'error');
    }
  };

  const handleGradeDelete = async (id) => {
    if (!window.confirm('Bu bahoni o\'chirmoqchisiz?')) return;
    try {
      await Api.grades.delete(id);
      showMsg('Baho o\'chirildi.');
      loadDashboardData();
    } catch (err) {
      showMsg('O\'chirishda xatolik.', 'error');
    }
  };

  // Schedule Management State & Actions
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    class_name: '', day: 'monday', subject: '', start_time: '', end_time: '', room: '', teacher: '2'
  });

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Api.schedule.create({
        ...scheduleForm,
        subject: parseInt(scheduleForm.subject),
        teacher: parseInt(scheduleForm.teacher),
        // Add seconds if not present
        start_time: scheduleForm.start_time.length === 5 ? `${scheduleForm.start_time}:00` : scheduleForm.start_time,
        end_time: scheduleForm.end_time.length === 5 ? `${scheduleForm.end_time}:00` : scheduleForm.end_time,
      });
      showMsg('Dars jadvali qo\'shildi!');
      setShowAddSchedule(false);
      setScheduleForm({ class_name: '', day: 'monday', subject: '', start_time: '', end_time: '', room: '', teacher: '2' });
      loadDashboardData();
    } catch (err) {
      showMsg(err.message || 'Jadval kiritishda xatolik yuz berdi.', 'error');
    }
  };

  const handleScheduleDelete = async (id) => {
    if (!window.confirm('Bu jadval elementini o\'chirmoqchisiz?')) return;
    try {
      await Api.schedule.delete(id);
      showMsg('Jadval o\'chirildi.');
      loadDashboardData();
    } catch (err) {
      showMsg('O\'chirishda xatolik.', 'error');
    }
  };

  // Subject Management State & Actions
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '' });

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    try {
      await Api.subjects.create(subjectForm);
      showMsg('Yangi fan yaratildi!');
      setShowAddSubject(false);
      setSubjectForm({ name: '', code: '' });
      loadDashboardData();
    } catch (err) {
      showMsg('Fan yaratishda xatolik.', 'error');
    }
  };

  const handleSubjectDelete = async (id) => {
    if (!window.confirm('Bu fanni o\'chirmoqchisiz? Unga bog\'liq jadval va baholar o\'chib ketishi mumkin.')) return;
    try {
      await Api.subjects.delete(id);
      showMsg('Fan o\'chirildi.');
      loadDashboardData();
    } catch (err) {
      showMsg('O\'chirishda xatolik.', 'error');
    }
  };

  const handleDownloadReport = async (type) => {
    try {
      const blob = type === 'attendance'
        ? await Api.reports.downloadAttendance()
        : await Api.reports.downloadGrades();
      const fileName = type === 'attendance' ? 'attendance_export.csv' : 'grades_export.csv';
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showMsg('Hisobot yuklab olindi.');
    } catch (err) {
      showMsg('Hisobot yuklab olishda xatolik yuz berdi.', 'error');
    }
  };

  const handleEnrollmentStatusUpdate = async (id, status) => {
    setEnrollmentBusyId(id);
    try {
      setEnrollments(prev => prev.map(item => (
        item.id === id ? { ...item, status } : item
      )));
      await Api.enrollments.update(id, { status });
      await loadDashboardData();
      showMsg(
        status === 'approved'
          ? 'Kurs yozilishi tasdiqlandi.'
          : 'Kurs yozilishi rad etildi.'
      );
    } catch (err) {
      showMsg(err.message || 'Yozilishni yangilashda xatolik yuz berdi.', 'error');
    } finally {
      setEnrollmentBusyId(null);
    }
  };

  // Extract unique classes from student profiles
  const classesList = [...new Set(students.map(s => s.class_group?.name || s.class_name))].filter(Boolean);

  const weekdayNames = {
    monday: 'Dushanba',
    tuesday: 'Seshanba',
    wednesday: 'Chorshanba',
    thursday: 'Payshanba',
    friday: 'Juma',
    saturday: 'Shanba',
    sunday: 'Yakshanba'
  };

  return (
    <div style={dashboardWrapper} className="container">
      {/* Alert toast notification */}
      {message.text && (
        <div style={{
          ...toastStyle,
          background: message.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(139, 92, 246, 0.95)',
          boxShadow: message.type === 'error' ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 0 20px rgba(139, 92, 246, 0.4)'
        }}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div style={headerStyle}>
        <div>
          <span className="section-tag">O'qituvchi / Administrator paneli</span>
          <h1 className="gradient-text" style={{ fontSize: '32px' }}>Tizim Boshqaruvi</h1>
        </div>
        <div style={roleBadgeStyle}>
          Role: {user.role === 'admin' ? 'Administrator' : 'O\'qituvchi'}
        </div>
      </div>

      {/* Tabs list */}
      <div style={tabsListStyle}>
        <button onClick={() => setActiveTab('dashboard')} style={activeTab === 'dashboard' ? activeTabStyle : tabStyle}>
          Dashboard
        </button>
        <button onClick={() => setActiveTab('students')} style={activeTab === 'students' ? activeTabStyle : tabStyle}>
          O'quvchilar
        </button>
        <button onClick={() => setActiveTab('attendance')} style={activeTab === 'attendance' ? activeTabStyle : tabStyle}>
          Davomat Kiritish
        </button>
        <button onClick={() => setActiveTab('grades')} style={activeTab === 'grades' ? activeTabStyle : tabStyle}>
          Baholash
        </button>
        <button onClick={() => setActiveTab('schedule')} style={activeTab === 'schedule' ? activeTabStyle : tabStyle}>
          Dars Jadvali
        </button>
        <button onClick={() => setActiveTab('enrollments')} style={activeTab === 'enrollments' ? activeTabStyle : tabStyle}>
          Kurs yozilishlari
        </button>
        <button onClick={() => setActiveTab('subjects')} style={activeTab === 'subjects' ? activeTabStyle : tabStyle}>
          Fanlar
        </button>
        <button onClick={() => setActiveTab('reports')} style={activeTab === 'reports' ? activeTabStyle : tabStyle}>
          Hisobot
        </button>
      </div>

      {loading ? (
        <div style={centeredContainer}>
          <span className="spinner"></span>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Ma'lumotlar yuklanmoqda...</p>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ width: '100%' }}>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={tabPanelStyle}>
              {/* Stats grid */}
              <div style={statsGridStyle}>
                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-purple)')}><Users size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>Jami O'quvchilar</span>
                    <h3 style={statValStyle}>{stats?.students || 0} nafar</h3>
                  </div>
                </div>

                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-green)')}><CheckCircle size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>Bugun Kelganlar</span>
                    <h3 style={statValStyle}>{stats?.present_today || 0} nafar</h3>
                  </div>
                </div>

                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-pink)')}><Award size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>O'rtacha Baho</span>
                    <h3 style={statValStyle}>{stats?.average_grade || 0}</h3>
                  </div>
                </div>

                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-blue)')}><Calendar size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>Jadvaldagi Darslar</span>
                    <h3 style={statValStyle}>{stats?.weekly_schedule_items || 0} ta</h3>
                  </div>
                </div>
              </div>

              {/* Alerts & Recents */}
              <div style={dashboardGridStyle}>
                {/* Absence Alerts Card */}
                <div className="glass-card" style={{ flex: 1 }}>
                  <h3 style={panelTitleStyle}><ShieldAlert size={18} color="var(--accent-red)" /> Absence Alerts (Ketma-ket 3 kun kelmaganlar)</h3>
                  {alerts.length === 0 ? (
                    <p style={noDataTextStyle}>Hech qanday xavfli davomat holati aniqlanmadi.</p>
                  ) : (
                    <div style={alertsListStyle}>
                      {alerts.map(alert => (
                        <div key={alert.student_id} style={alertCardStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle size={18} color="var(--accent-red)" />
                            <div>
                              <h4 style={alertNameStyle}>{alert.name}</h4>
                              <span style={alertClassStyle}>Sinf: {alert.class_name}</span>
                            </div>
                          </div>
                          <span className="badge badge-absent">Tizim ogohlantirishi</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Card */}
                <div className="glass-card" style={infoCardStyle}>
                  <h3 style={panelTitleStyle}><ClipboardList size={18} color="var(--accent-blue)" /> Platforma Holati</h3>
                  <div style={infoContentStyle}>
                    <p>Ushbu paneldan o'quv jarayonini boshqarish uchun foydalaning.</p>
                    <ul style={infoListStyle}>
                      <li>Yangi o'quvchilar qo'shish va ularni sinflarga taqsimlash;</li>
                      <li>Kunlik davomat va o'quvchilarning baholarini kiritish;</li>
                      <li>Haftalik dars jadvalini shakllantirish va tahrirlash;</li>
                      <li>Darslarda qatnashmayotgan o'quvchilarni ogohlantirish paneli orqali aniqlash.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS */}
          {activeTab === 'students' && (
            <div style={tabPanelStyle}>
              <div style={actionRowStyle}>
                <h3 style={panelTitleStyle}>O'quvchilar Ro'yxati</h3>
                <button onClick={() => setShowAddStudent(!showAddStudent)} className="btn-primary">
                  {showAddStudent ? <X size={16} /> : <Plus size={16} />}
                  {showAddStudent ? 'Yopish' : 'Yangi o\'quvchi qo\'shish'}
                </button>
              </div>

              {/* Add Student Form */}
              {showAddStudent && (
                <form onSubmit={handleStudentCreate} className="glass-card" style={formCardStyle}>
                  <h4 style={{ marginBottom: '16px', color: '#fff' }}>Yangi O'quvchi Ma'lumotlari</h4>
                  <div style={formGridStyle}>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Ism</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="Dilshod"
                        value={studentForm.first_name}
                        onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Familiya</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="Akramov"
                        value={studentForm.last_name}
                        onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                        required
                      />
                    </div>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Username</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="dilshod_akramov"
                        value={studentForm.username}
                        onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Maxfiy so'z</label>
                      <input
                        type="password"
                        className="glass-input"
                        placeholder="••••••••"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Sinf nomi (Guruh)</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="Guruh-102"
                        value={studentForm.class_name}
                        onChange={(e) => setStudentForm({ ...studentForm, class_name: e.target.value })}
                        required
                      />
                    </div>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Telefon raqam</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="+998 90 987 65 43"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      />
                    </div>
                    <div style={{ ...inputGroupStyle, gridColumn: 'span 2' }}>
                      <label style={labelStyle}>Elektron pochta (Email)</label>
                      <input
                        type="email"
                        className="glass-input"
                        placeholder="email@example.com"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>O'quvchini Saqlash</button>
                </form>
              )}

              {/* Edit Student Modal / Form */}
              {editingStudent && (
                <form onSubmit={handleStudentUpdate} className="glass-card" style={formCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ color: '#fff' }}>O'quvchini tahrirlash: {editingStudent.first_name} {editingStudent.last_name}</h4>
                    <button type="button" className="btn-icon" onClick={() => setEditingStudent(null)}><X size={16} /></button>
                  </div>
                  <div style={formGridStyle}>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Sinf (Guruh)</label>
                      <input
                        type="text"
                        className="glass-input"
                        value={editingStudent.class_name}
                        onChange={(e) => setEditingStudent({ ...editingStudent, class_name: e.target.value })}
                        required
                      />
                    </div>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Telefon raqam</label>
                      <input
                        type="text"
                        className="glass-input"
                        value={editingStudent.phone}
                        onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      />
                    </div>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Status</label>
                      <select
                        className="glass-input glass-select"
                        value={editingStudent.is_active}
                        onChange={(e) => setEditingStudent({ ...editingStudent, is_active: e.target.value === 'true' })}
                      >
                        <option value="true">Faol (Active)</option>
                        <option value="false">Nofaol (Inactive)</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>Saqlash</button>
                </form>
              )}

              {/* Student table */}
              <div className="custom-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Talaba</th>
                      <th>Username</th>
                      <th>Sinf (Guruh)</th>
                      <th>Telefon</th>
                      <th>Status</th>
                      <th>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(stud => (
                      <tr key={stud.id}>
                        <td style={{ fontWeight: '600' }}>{stud.first_name} {stud.last_name}</td>
                        <td>{stud.username}</td>
                        <td>{stud.class_name || '-'}</td>
                        <td>{stud.phone || '-'}</td>
                        <td>
                          <span className={`badge ${stud.is_active ? 'badge-present' : 'badge-absent'}`}>
                            {stud.is_active ? 'Faol' : 'Nofaol'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setEditingStudent(stud)} className="btn-icon" title="Tahrirlash">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleStudentDelete(stud.id)} className="btn-icon" style={{ color: 'var(--accent-red)' }} title="O'chirish">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div style={tabPanelStyle}>
              <h3 style={panelTitleStyle}>Davomat Kiritish</h3>
              <div className="glass-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Sinfni tanlang</label>
                    <select
                      className="glass-input glass-select"
                      style={{ minWidth: '180px' }}
                      value={attClass}
                      onChange={(e) => setAttClass(e.target.value)}
                    >
                      <option value="">-- Sinf tanlang --</option>
                      {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Fanni tanlang</label>
                    <select
                      className="glass-input glass-select"
                      style={{ minWidth: '180px' }}
                      value={attSubject}
                      onChange={(e) => setAttSubject(e.target.value)}
                    >
                      <option value="">-- Fanni tanlang --</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Sana</label>
                    <input
                      type="date"
                      className="glass-input"
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                    />
                  </div>

                  <button onClick={handleFetchClassStudents} className="btn-primary" style={{ height: '46px' }}>
                    O'quvchilarni yuklash
                  </button>
                </div>
              </div>

              {classStudents.length > 0 ? (
                <div className="glass-card">
                  <h4 style={{ color: '#fff', marginBottom: '20px' }}>Sinf: {attClass} o'quvchilari uchun davomat</h4>
                  <div className="custom-table-wrapper" style={{ marginBottom: '20px' }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Talaba</th>
                          <th>Holati (Status)</th>
                          <th>Izoh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map(student => (
                          <tr key={student.id}>
                            <td style={{ fontWeight: '600' }}>{student.first_name} {student.last_name}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleAttendanceChange(student.id, 'status', 'present')}
                                  style={{
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    background: attStatuses[student.id]?.status === 'present' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.02)',
                                    color: attStatuses[student.id]?.status === 'present' ? 'var(--accent-green)' : 'var(--text-secondary)',
                                    border: attStatuses[student.id]?.status === 'present' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                                  }}
                                >
                                  Keldi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAttendanceChange(student.id, 'status', 'absent')}
                                  style={{
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    background: attStatuses[student.id]?.status === 'absent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.02)',
                                    color: attStatuses[student.id]?.status === 'absent' ? 'var(--accent-red)' : 'var(--text-secondary)',
                                    border: attStatuses[student.id]?.status === 'absent' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                                  }}
                                >
                                  Kelmadi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAttendanceChange(student.id, 'status', 'late')}
                                  style={{
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    background: attStatuses[student.id]?.status === 'late' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.02)',
                                    color: attStatuses[student.id]?.status === 'late' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                                    border: attStatuses[student.id]?.status === 'late' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                                  }}
                                >
                                  Kechikdi
                                </button>
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="glass-input"
                                placeholder="Sababli yoki boshqa izoh..."
                                style={{ padding: '8px 12px' }}
                                value={attStatuses[student.id]?.note || ''}
                                onChange={(e) => handleAttendanceChange(student.id, 'note', e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={handleSaveAttendance} className="btn-primary">Davomatni Saqlash</button>
                </div>
              ) : (
                attClass && <p style={noDataTextStyle}>Ushbu sinfda hech qanday o'quvchi topilmadi.</p>
              )}
            </div>
          )}

          {/* TAB 4: GRADES */}
          {activeTab === 'grades' && (
            <div style={tabPanelStyle}>
              <h3 style={panelTitleStyle}>Baholash</h3>
              <div style={mainContentGridStyle}>
                {/* Log Grade Form */}
                <form onSubmit={handleGradeSubmit} className="glass-card" style={{ flex: 1 }}>
                  <h4 style={{ color: '#fff', marginBottom: '16px' }}>O'quvchiga baho qo'yish</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>O'quvchini tanlang</label>
                      <select
                        className="glass-input glass-select"
                        value={gradeForm.student}
                        onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })}
                        required
                      >
                        <option value="">-- O'quvchini tanlang --</option>
                        {students.filter(s => s.is_active).map(s => (
                          <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.class_name})</option>
                        ))}
                      </select>
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Fanni tanlang</label>
                      <select
                        className="glass-input glass-select"
                        value={gradeForm.subject}
                        onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })}
                        required
                      >
                        <option value="">-- Fanni tanlang --</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Baho tizimi (Scale)</label>
                      <select
                        className="glass-input glass-select"
                        value={gradeForm.scale}
                        onChange={(e) => setGradeForm({ ...gradeForm, scale: e.target.value })}
                      >
                        <option value="five">1-5 Baholash</option>
                        <option value="percent">100% Baholash</option>
                      </select>
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Baho / Ball</label>
                      <input
                        type="number"
                        step="0.01"
                        className="glass-input"
                        placeholder={gradeForm.scale === 'five' ? '5.00' : '95.00'}
                        value={gradeForm.score}
                        onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                        required
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Sana</label>
                      <input
                        type="date"
                        className="glass-input"
                        value={gradeForm.date}
                        onChange={(e) => setGradeForm({ ...gradeForm, date: e.target.value })}
                        required
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Izoh (Ixtiyoriy)</label>
                      <textarea
                        className="glass-input"
                        placeholder="Faol qatnashdi, uy ishi a'lo..."
                        style={{ minHeight: '80px', resize: 'vertical' }}
                        value={gradeForm.note}
                        onChange={(e) => setGradeForm({ ...gradeForm, note: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Bahoni Kiritish</button>
                  </div>
                </form>

                {/* Recently Logged Grades */}
                <div className="glass-card" style={{ flex: 1.5 }}>
                  <h4 style={{ color: '#fff', marginBottom: '16px' }}>Yaqinda kiritilgan baholar</h4>
                  {grades.length === 0 ? (
                    <p style={noDataTextStyle}>Hali hech qanday baho yozilmagan.</p>
                  ) : (
                    <div className="custom-table-wrapper">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>O'quvchi</th>
                            <th>Fan</th>
                            <th>Baho</th>
                            <th>Sana</th>
                            <th>O'chirish</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grades.slice(0, 10).map(g => {
                            const stud = students.find(s => s.id === g.student);
                            const subj = subjects.find(s => s.id === g.subject);
                            return (
                              <tr key={g.id}>
                                <td>{stud ? `${stud.first_name} ${stud.last_name}` : `Talaba #${g.student}`}</td>
                                <td>{subj?.name || `Fan #${g.subject}`}</td>
                                <td style={{ fontWeight: '700', color: 'var(--accent-purple)' }}>
                                  {parseFloat(g.score)} ({g.scale === 'five' ? '1-5' : '100%'})
                                </td>
                                <td>{new Date(g.date).toLocaleDateString()}</td>
                                <td>
                                  <button onClick={() => handleGradeDelete(g.id)} className="btn-icon" style={{ color: 'var(--accent-red)' }}>
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div style={tabPanelStyle}>
              <div style={actionRowStyle}>
                <h3 style={panelTitleStyle}>Dars Jadvali</h3>
                <button onClick={() => setShowAddSchedule(!showAddSchedule)} className="btn-primary">
                  {showAddSchedule ? <X size={16} /> : <Plus size={16} />}
                  {showAddSchedule ? 'Yopish' : 'Dars jadvali qo\'shish'}
                </button>
              </div>

              {showAddSchedule && (
                <form onSubmit={handleScheduleSubmit} className="glass-card" style={{ ...formCardStyle, marginBottom: '24px' }}>
                  <h4 style={{ color: '#fff', marginBottom: '16px' }}>Yangi Dars Jadvali Elementi</h4>
                  <div style={formGridStyle}>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Sinf nomi (Guruh)</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="Guruh-102"
                        value={scheduleForm.class_name}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, class_name: e.target.value })}
                        required
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Hafta kuni</label>
                      <select
                        className="glass-input glass-select"
                        value={scheduleForm.day}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                      >
                        {Object.entries(weekdayNames).map(([key, name]) => (
                          <option key={key} value={key}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Fanni tanlang</label>
                      <select
                        className="glass-input glass-select"
                        value={scheduleForm.subject}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })}
                        required
                      >
                        <option value="">-- Fan --</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Xona</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="Room 304"
                        value={scheduleForm.room}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Boshlanish vaqti</label>
                      <input
                        type="time"
                        className="glass-input"
                        value={scheduleForm.start_time}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                        required
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Tugash vaqti</label>
                      <input
                        type="time"
                        className="glass-input"
                        value={scheduleForm.end_time}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                        required
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>O'qituvchi</label>
                      <select
                        className="glass-input glass-select"
                        value={scheduleForm.teacher}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, teacher: e.target.value })}
                      >
                        <option value="2">teacher1 (O'qituvchi)</option>
                        <option value="1">admin (Admin)</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>Jadvalni Saqlash</button>
                </form>
              )}

              <div className="custom-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Sinf (Guruh)</th>
                      <th>Kun</th>
                      <th>Vaqt</th>
                      <th>Fan</th>
                      <th>Xona</th>
                      <th>O'qituvchi</th>
                      <th>O'chirish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(sched => {
                      const subj = subjects.find(s => s.id === sched.subject);
                      return (
                        <tr key={sched.id}>
                          <td style={{ fontWeight: '600' }}>{sched.class_name}</td>
                          <td>{weekdayNames[sched.day]}</td>
                          <td>{sched.start_time.substring(0, 5)} - {sched.end_time.substring(0, 5)}</td>
                          <td>{subj?.name || `Fan #${sched.subject}`}</td>
                          <td>{sched.room || '-'}</td>
                          <td>{sched.teacher === 1 ? 'admin' : 'teacher1'}</td>
                          <td>
                            <button onClick={() => handleScheduleDelete(sched.id)} className="btn-icon" style={{ color: 'var(--accent-red)' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ENROLLMENTS */}
          {activeTab === 'enrollments' && (
            <div style={tabPanelStyle}>
              <div style={actionRowStyle}>
                <h3 style={panelTitleStyle}>Kursga yozilishlar</h3>
              </div>

              <div style={statsGridStyle}>
                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-blue)')}><ClipboardList size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>Jami yozilishlar</span>
                    <h3 style={statValStyle}>{enrollments.length}</h3>
                  </div>
                </div>
                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-orange)')}><Clock size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>Kutilmoqda</span>
                    <h3 style={statValStyle}>
                      {enrollments.filter(item => item.status === 'pending').length}
                    </h3>
                  </div>
                </div>
                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-green)')}><CheckCircle size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>Tasdiqlangan</span>
                    <h3 style={statValStyle}>
                      {enrollments.filter(item => item.status === 'approved').length}
                    </h3>
                  </div>
                </div>
                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-red)')}><AlertTriangle size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>Rad etilgan</span>
                    <h3 style={statValStyle}>
                      {enrollments.filter(item => item.status === 'rejected').length}
                    </h3>
                  </div>
                </div>
              </div>

              <div style={enrollmentBoardStyle}>
                {[
                  { key: 'pending', title: 'Kutilmoqda', tone: 'orange' },
                  { key: 'approved', title: 'Tasdiqlangan', tone: 'green' },
                  { key: 'rejected', title: 'Rad etilgan', tone: 'red' },
                ].map(column => {
                  const items = enrollments.filter(item => item.status === column.key);
                  return (
                    <div key={column.key} className="glass-card" style={enrollmentColumnStyle}>
                      <div style={enrollmentColumnHeaderStyle}>
                        <h4 style={enrollmentColumnTitleStyle(column.tone)}>{column.title}</h4>
                        <span style={enrollmentCountStyle}>{items.length}</span>
                      </div>
                      <div style={enrollmentColumnBodyStyle}>
                        {items.length === 0 ? (
                          <p style={noDataTextStyle}>Hozircha yozuv yo'q.</p>
                        ) : (
                          items.map(item => (
                            <div key={item.id} style={enrollmentCardStyle}>
                              <div style={enrollmentCardTopStyle}>
                                <div>
                                  <strong style={enrollmentNameStyle}>{item.student_name}</strong>
                                  <div style={enrollmentMetaStyle}>{item.subject_name} | {item.class_name || '-'}</div>
                                </div>
                                <span className="badge" style={enrollmentStatusStyle(column.key)}>
                                  {column.title}
                                </span>
                              </div>
                              <div style={enrollmentDetailsStyle}>
                                <span>Telefon: <b>{item.phone || '-'}</b></span>
                                <span>Sana: <b>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</b></span>
                                {item.note && <span>Izoh: <b>{item.note}</b></span>}
                              </div>
                              <div style={enrollmentActionsStyle}>
                                <button
                                  className="btn-icon"
                                  title="Tasdiqlash"
                                  disabled={enrollmentBusyId === item.id || item.status === 'approved'}
                                  onClick={() => handleEnrollmentStatusUpdate(item.id, 'approved')}
                                  style={{ color: 'var(--accent-green)', opacity: enrollmentBusyId === item.id || item.status === 'approved' ? 0.5 : 1 }}
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  className="btn-icon"
                                  title="Rad etish"
                                  disabled={enrollmentBusyId === item.id || item.status === 'rejected'}
                                  onClick={() => handleEnrollmentStatusUpdate(item.id, 'rejected')}
                                  style={{ color: 'var(--accent-red)', opacity: enrollmentBusyId === item.id || item.status === 'rejected' ? 0.5 : 1 }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div style={tabPanelStyle}>
              <div style={actionRowStyle}>
                <h3 style={panelTitleStyle}>Fanlar Ro'yxati</h3>
                <button onClick={() => setShowAddSubject(!showAddSubject)} className="btn-primary">
                  {showAddSubject ? <X size={16} /> : <Plus size={16} />}
                  {showAddSubject ? 'Yopish' : 'Yangi fan qo\'shish'}
                </button>
              </div>

              {showAddSubject && (
                <form onSubmit={handleSubjectSubmit} className="glass-card" style={{ ...formCardStyle, marginBottom: '24px' }}>
                  <h4 style={{ color: '#fff', marginBottom: '16px' }}>Yangi fan ma'lumotlari</h4>
                  <div style={formGridStyle}>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Fan nomi</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="Matematika"
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Fan kodi</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="MATH-101"
                        value={subjectForm.code}
                        onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>Fanni Saqlash</button>
                </form>
              )}

              <div className="custom-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Fan nomi</th>
                      <th>Kodi</th>
                      <th>Holati</th>
                      <th>O'chirish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subj => (
                      <tr key={subj.id}>
                        <td style={{ fontWeight: '600' }}>{subj.name}</td>
                        <td>{subj.code || '-'}</td>
                        <td>
                          <span className={`badge ${subj.is_active ? 'badge-present' : 'badge-absent'}`}>
                            {subj.is_active ? 'Aktiv' : 'Nofaol'}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => handleSubjectDelete(subj.id)} className="btn-icon" style={{ color: 'var(--accent-red)' }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: REPORTS */}
          {activeTab === 'reports' && (
            <div style={tabPanelStyle}>
              <div style={actionRowStyle}>
                <h3 style={panelTitleStyle}>Hisobot va Statistika</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={() => handleDownloadReport('attendance')}>
                    Davomat CSV
                  </button>
                  <button className="btn-primary" onClick={() => handleDownloadReport('grades')}>
                    Baholar CSV
                  </button>
                </div>
              </div>

              <div style={statsGridStyle}>
                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-blue)')}><ClipboardList size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>Sinf Guruhlari</span>
                    <h3 style={statValStyle}>{classSummary.length} ta</h3>
                  </div>
                </div>
                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-green)')}><CheckCircle size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>Yuklab olish</span>
                    <h3 style={statValStyle}>CSV</h3>
                  </div>
                </div>
                <div className="glass-card" style={statCardStyle}>
                  <div style={statIconStyle('var(--accent-pink)')}><Award size={22} /></div>
                  <div>
                    <span style={statLabelStyle}>O'rtacha baho</span>
                    <h3 style={statValStyle}>{stats?.average_grade || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <h3 style={panelTitleStyle}><Users size={18} color="var(--accent-blue)" /> Sinflar bo'yicha qisqa ma'lumot</h3>
                {classSummary.length === 0 ? (
                  <p style={noDataTextStyle}>Hozircha sinf summary mavjud emas.</p>
                ) : (
                  <div style={reportsGridStyle}>
                    {classSummary.map(item => (
                      <div key={item.group_id || item.label} className="glass-card" style={reportCardStyle}>
                        <h4 style={{ color: '#fff', marginBottom: '10px' }}>{item.label}</h4>
                        <div style={reportMetricsStyle}>
                          <span>O'quvchilar: <b>{item.students}</b></span>
                          <span>Jadval: <b>{item.schedule_items}</b></span>
                          <span>O'rtacha baho: <b>{item.average_grade}</b></span>
                          <span>Bugun kelgan: <b>{item.present_today}</b></span>
                          <span>Bugun kelmagan: <b>{item.absent_today}</b></span>
                          <span>Kechikkan: <b>{item.late_today}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Styling definitions
const toastStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 1100,
  padding: '12px 24px',
  borderRadius: '8px',
  color: '#fff',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  animation: 'modalSlideUp 0.3s ease forwards',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
  flexWrap: 'wrap',
  gap: '16px',
};

const roleBadgeStyle = {
  background: 'rgba(139, 92, 246, 0.1)',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  padding: '8px 16px',
  borderRadius: '9999px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#c084fc',
};

const tabsListStyle = {
  display: 'flex',
  borderBottom: '1px solid var(--border-color)',
  marginBottom: '32px',
  gap: '8px',
  overflowX: 'auto',
  paddingBottom: '4px',
};

const tabStyle = {
  background: 'none',
  border: 'none',
  borderBottomWidth: '2px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'transparent',
  color: 'var(--text-secondary)',
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
};

const activeTabStyle = {
  ...tabStyle,
  color: 'var(--accent-purple)',
  borderBottomColor: 'var(--accent-purple)',
  background: 'rgba(139, 92, 246, 0.05)',
  borderRadius: '6px 6px 0 0',
};

const tabPanelStyle = {
  width: '100%',
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '20px',
  marginBottom: '32px',
};

const statCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const statIconStyle = (color) => ({
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  background: `rgba(${color.includes('purple') ? '139,92,246' : color.includes('green') ? '16,185,129' : color.includes('pink') ? '236,72,153' : '59,130,246'}, 0.1)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color,
});

const statLabelStyle = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
};

const statValStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#fff',
  marginTop: '2px',
};

const dashboardGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr',
  gap: '24px',
};

const panelTitleStyle = {
  fontSize: '18px',
  color: '#fff',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const noDataTextStyle = {
  color: 'var(--text-muted)',
  fontSize: '14px',
};

const alertsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const alertCardStyle = {
  background: 'rgba(239, 68, 68, 0.03)',
  border: '1px solid rgba(239, 68, 68, 0.1)',
  borderRadius: '8px',
  padding: '14px 18px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const alertNameStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#fff',
};

const alertClassStyle = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
};

const infoCardStyle = {
  flex: 1,
};

const infoContentStyle = {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
};

const infoListStyle = {
  paddingLeft: '20px',
  marginTop: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const actionRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
};

const formCardStyle = {
  marginBottom: '24px',
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  fontWeight: '500',
};

const mainContentGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.5fr',
  gap: '24px',
};

const centeredContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '100px 24px',
};

const reportsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '16px',
};

const enrollmentBoardStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '16px',
  alignItems: 'start',
};

const enrollmentColumnStyle = {
  padding: '16px',
  minHeight: '320px',
};

const enrollmentColumnHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
};

const enrollmentColumnTitleStyle = (tone) => ({
  color: tone === 'green'
    ? 'var(--accent-green)'
    : tone === 'red'
      ? 'var(--accent-red)'
      : 'var(--accent-orange)',
  fontSize: '16px',
  fontWeight: '700',
});

const enrollmentCountStyle = {
  minWidth: '30px',
  height: '30px',
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: '700',
};

const enrollmentColumnBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const enrollmentCardStyle = {
  padding: '14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const enrollmentCardTopStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
};

const enrollmentNameStyle = {
  color: '#fff',
  fontSize: '14px',
};

const enrollmentMetaStyle = {
  color: 'var(--text-secondary)',
  fontSize: '12px',
  marginTop: '4px',
};

const enrollmentStatusStyle = (status) => ({
  background: status === 'approved'
    ? 'rgba(16, 185, 129, 0.14)'
    : status === 'rejected'
      ? 'rgba(239, 68, 68, 0.14)'
      : 'rgba(245, 158, 11, 0.14)',
  color: status === 'approved'
    ? 'var(--accent-green)'
    : status === 'rejected'
      ? 'var(--accent-red)'
      : 'var(--accent-orange)',
  border: `1px solid ${status === 'approved'
      ? 'rgba(16, 185, 129, 0.35)'
      : status === 'rejected'
        ? 'rgba(239, 68, 68, 0.35)'
        : 'rgba(245, 158, 11, 0.35)'
    }`,
});

const enrollmentDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  color: 'var(--text-secondary)',
  fontSize: '12px',
};

const enrollmentActionsStyle = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end',
};

const reportCardStyle = {
  padding: '16px',
};

const reportMetricsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '13px',
  color: 'var(--text-secondary)',
};

const dashboardWrapper = {
  paddingTop: '40px',
  paddingBottom: '80px',
};
