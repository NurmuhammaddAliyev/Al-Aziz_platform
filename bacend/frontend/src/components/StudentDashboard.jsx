import React, {useState, useEffect} from 'react';
import {User, Calendar, Award, CheckCircle, Clock, BookOpen, MessageSquare, AlertCircle} from 'lucide-react';
import {Api} from '../services/Api';

export default function StudentDashboard({user}) {
    const [profile, setProfile] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [subjects, setSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadData() {
            try {
                // Load student profile (if user role is student, queryset returns their profile)
                // Backend pagination: {count, next, previous, results: [...]}
                const profilesRes = await Api.students.list();
                const profiles = Array.isArray(profilesRes) ? profilesRes : (profilesRes?.results || []);
                if (profiles.length > 0) {
                    setProfile(profiles[0]);
                }

                // Load subjects for lookup
                const subListRes = await Api.subjects.list();
                const subList = Array.isArray(subListRes) ? subListRes : (subListRes?.results || []);
                const subMap = {};
                subList.forEach(s => {
                    subMap[s.id] = s.name;
                });
                setSubjects(subMap);

                // Load schedule
                const schedListRes = await Api.schedule.list();
                const schedList = Array.isArray(schedListRes) ? schedListRes : (schedListRes?.results || []);
                setSchedule(schedList);

                // Load grades
                const gradesListRes = await Api.grades.list();
                const gradesList = Array.isArray(gradesListRes) ? gradesListRes : (gradesListRes?.results || []);
                setGrades(gradesList);

                // Load attendance
                const attendanceListRes = await Api.attendance.list();
                const attendanceList = Array.isArray(attendanceListRes) ? attendanceListRes : (attendanceListRes?.results || []);
                setAttendance(attendanceList);

                // Load enrollments
                const enrollmentsListRes = await Api.enrollments.list();
                const enrollmentsList = Array.isArray(enrollmentsListRes) ? enrollmentsListRes : (enrollmentsListRes?.results || []);
                setEnrollments(enrollmentsList);

            } catch (err) {
                console.error('Error loading dashboard data:', err);
                setError('Ma\'lumotlarni yuklashda xatolik yuz berdi.');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <div style={centeredContainer}><span className="spinner"></span><p
                style={{marginTop: '12px', color: 'var(--text-secondary)'}}>Yuklanmoqda...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={centeredContainer}>
                <AlertCircle size={40} color="var(--accent-red)"/>
                <p style={{marginTop: '12px', color: 'var(--accent-red)'}}>{error}</p>
            </div>
        );
    }

    // Calculate Attendance Stats
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Group grades by subject & calculate averages
    const gradesBySubject = {};
    grades.forEach(g => {
        const subName = subjects[g.subject] || `Fan #${g.subject}`;
        if (!gradesBySubject[subName]) {
            gradesBySubject[subName] = [];
        }
        gradesBySubject[subName].push(g);
    });

    const subjectAverages = Object.entries(gradesBySubject).map(([subName, list]) => {
        const sum = list.reduce((acc, curr) => acc + parseFloat(curr.score), 0);
        const avg = sum / list.length;
        return {name: subName, avg: avg.toFixed(2), count: list.length, items: list};
    });

    const totalAvg = subjectAverages.length > 0
        ? (subjectAverages.reduce((acc, curr) => acc + parseFloat(curr.avg), 0) / subjectAverages.length).toFixed(2)
        : '0.00';

    // Group schedule by weekday
    const weekdayNames = {
        monday: 'Dushanba',
        tuesday: 'Seshanba',
        wednesday: 'Chorshanba',
        thursday: 'Payshanba',
        friday: 'Juma',
        saturday: 'Shanba',
        sunday: 'Yakshanba'
    };

    const scheduleByDay = {
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
    };
    schedule.forEach(item => {
        if (scheduleByDay[item.day]) {
            scheduleByDay[item.day].push(item);
        }
    });

    return (
        <div style={dashboardWrapper} className="container animate-fade-in">
            <div style={headerSection}>
                <div>
                    <span className="section-tag">O'quvchi kabineti</span>
                    <h1 className="gradient-text" style={{fontSize: '32px'}}>
                        Xush kelibsiz, {user.first_name} {user.last_name}!
                    </h1>
                </div>
                <div className="badge badge-present" style={{padding: '8px 16px', fontSize: '14px'}}>
                    Guruh: {profile?.class_group?.name || profile?.class_name || 'Aniqlanmagan'}
                </div>
            </div>

            <div style={statsGrid}>
                <div className="glass-card" style={statCard}>
                    <div style={statIconWrapper('var(--accent-purple)')}>
                        <Award size={20} color="var(--accent-purple)"/>
                    </div>
                    <div>
                        <span style={statLabel}>O'rtacha Baho</span>
                        <h3 style={statValue}>{totalAvg}</h3>
                    </div>
                </div>

                <div className="glass-card" style={statCard}>
                    <div style={statIconWrapper('var(--accent-green)')}>
                        <CheckCircle size={20} color="var(--accent-green)"/>
                    </div>
                    <div>
                        <span style={statLabel}>Davomat Ko'rsatkichi</span>
                        <h3 style={statValue}>{attendanceRate}%</h3>
                    </div>
                </div>

                <div className="glass-card" style={statCard}>
                    <div style={statIconWrapper('var(--accent-blue)')}>
                        <Calendar size={20} color="var(--accent-blue)"/>
                    </div>
                    <div>
                        <span style={statLabel}>Haftalik Darslar</span>
                        <h3 style={statValue}>{schedule.length} ta dars</h3>
                    </div>
                </div>
            </div>

            <div style={mainContentGrid}>
                {/* LEFT COLUMN: Profile & Schedule */}
                <div style={leftColStyle}>
                    {/* Profile Card */}
                    <div className="glass-card" style={profileCardStyle}>
                        <div style={profileHeader}>
                            <div style={avatarStyle}>
                                {profile?.photo ? (
                                    <img src={profile.photo} alt="Avatar" style={avatarImgStyle}/>
                                ) : (
                                    <User size={32} color="#fff"/>
                                )}
                            </div>
                            <div>
                                <h3 style={profileName}>{user.first_name} {user.last_name}</h3>
                                <p style={profileEmail}>{user.email || 'Email kiritilmagan'}</p>
                            </div>
                        </div>
                        <div style={divider}></div>
                        <div style={profileDetails}>
                            <div style={detailRow}>
                                <span style={detailLabel}>Username:</span>
                                <span style={detailVal}>{user.username}</span>
                            </div>
                            <div style={detailRow}>
                                <span style={detailLabel}>Telefon:</span>
                                <span style={detailVal}>{profile?.phone || 'Kiritilmagan'}</span>
                            </div>
                            <div style={detailRow}>
                                <span style={detailLabel}>Ro'yxatdan o'tgan sana:</span>
                                <span
                                    style={detailVal}>{profile ? new Date(profile.joined_at).toLocaleDateString() : '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Enrollments Card */}
                    <div className="glass-card">
                        <h3 style={sectionTitleStyle}><BookOpen size={18} color="var(--accent-purple)"/> Mening
                            Kurslarim</h3>
                        {enrollments.length === 0 ? (
                            <p style={noDataText}>Siz hali hech qaysi kursga yozilmagansiz.</p>
                        ) : (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px'}}>
                                {enrollments.map(item => (
                                    <div key={item.id} style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <strong
                                                style={{color: '#fff', fontSize: '14px'}}>{item.subject_name}</strong>
                                            <span className={`badge ${
                                                item.status === 'approved' ? 'badge-present' : item.status === 'rejected' ? 'badge-absent' : 'badge-late'
                                            }`} style={{fontSize: '11px', padding: '2px 8px'}}>
                        {item.status === 'approved' ? 'Tasdiqlangan' : item.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                      </span>
                                        </div>
                                        {item.note && <span style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '12px'
                                        }}>Izoh: {item.note}</span>}
                                        <span style={{color: 'var(--text-muted)', fontSize: '11px'}}>
                      Sana: {new Date(item.created_at).toLocaleDateString()}
                    </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Schedule Card */}
                    <div className="glass-card" style={{flex: 1}}>
                        <h3 style={sectionTitleStyle}><Clock size={18} color="var(--accent-blue)"/> Dars Jadvali</h3>
                        <div style={scheduleListStyle}>
                            {schedule.length === 0 ? (
                                <p style={noDataText}>Dars jadvali mavjud emas.</p>
                            ) : (
                                Object.entries(scheduleByDay).map(([dayKey, items]) => {
                                    if (items.length === 0) return null;
                                    return (
                                        <div key={dayKey} style={daySectionStyle}>
                                            <h4 style={dayNameStyle}>{weekdayNames[dayKey]}</h4>
                                            <div style={dayLessonsContainer}>
                                                {items.map(item => (
                                                    <div key={item.id} style={lessonCardStyle}>
                                                        <div style={lessonMetaStyle}>
                                                            <span
                                                                style={lessonTimeStyle}>{item.start_time.substring(0, 5)} - {item.end_time.substring(0, 5)}</span>
                                                            <span
                                                                style={lessonRoomStyle}>Xona {item.room || 'Aniqlanmagan'}</span>
                                                        </div>
                                                        <h5 style={lessonSubjectStyle}>{subjects[item.subject] || `Fan #${item.subject}`}</h5>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Grades & Attendance */}
                <div style={rightColStyle}>
                    {/* Grades Card */}
                    <div className="glass-card">
                        <h3 style={sectionTitleStyle}><Award size={18} color="var(--accent-pink)"/> O'zlashtirish va
                            Baholar</h3>
                        {subjectAverages.length === 0 ? (
                            <p style={noDataText}>Baholar mavjud emas.</p>
                        ) : (
                            <div style={subjectGradesListStyle}>
                                {subjectAverages.map(sub => (
                                    <div key={sub.name} style={subjectGradeRowStyle}>
                                        <div style={subjectRowHeaderStyle}>
                                            <span style={subjectNameStyle}>{sub.name}</span>
                                            <span style={subjectAvgStyle}
                                                  className={parseFloat(sub.avg) >= 4 ? 'badge badge-present' : 'badge badge-late'}>
                        O'rtacha: {sub.avg}
                      </span>
                                        </div>
                                        <div style={badgeContainerStyle}>
                                            {sub.items.map(item => (
                                                <div key={item.id} style={gradeBadgeStyle}
                                                     title={`Sana: ${item.date}${item.note ? `\nIzoh: ${item.note}` : ''}`}>
                                                    <span style={gradeScoreStyle}>{parseFloat(item.score)}</span>
                                                    <span
                                                        style={gradeDateStyle}>{new Date(item.date).toLocaleDateString('uz-UZ', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Attendance Card */}
                    <div className="glass-card">
                        <h3 style={sectionTitleStyle}><CheckCircle size={18} color="var(--accent-green)"/> Davomat
                            Tarixi</h3>
                        <div style={attendanceSummaryGrid}>
                            <div style={attendanceSumItem('var(--accent-green)')}>
                                <span style={sumVal}>{presentDays}</span>
                                <span style={sumLabel}>Kelgan (Keldi)</span>
                            </div>
                            <div style={attendanceSumItem('var(--accent-red)')}>
                                <span style={sumVal}>{absentDays}</span>
                                <span style={sumLabel}>Kelmadi</span>
                            </div>
                            <div style={attendanceSumItem('var(--accent-orange)')}>
                                <span style={sumVal}>{lateDays}</span>
                                <span style={sumLabel}>Kech qoldi</span>
                            </div>
                        </div>

                        {attendance.length === 0 ? (
                            <p style={noDataText}>Davomat yozuvlari mavjud emas.</p>
                        ) : (
                            <div className="custom-table-wrapper" style={{marginTop: '20px'}}>
                                <table className="custom-table">
                                    <thead>
                                    <tr>
                                        <th>Sana</th>
                                        <th>Status</th>
                                        <th>Izoh</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {attendance.map(a => (
                                        <tr key={a.id}>
                                            <td>{new Date(a.date).toLocaleDateString()}</td>
                                            <td>
                          <span
                              className={`badge ${a.status === 'present' ? 'badge-present' : a.status === 'absent' ? 'badge-absent' : 'badge-late'}`}>
                            {a.status === 'present' ? 'Keldi' : a.status === 'absent' ? 'Kelmadi' : 'Kech qoldi'}
                          </span>
                                            </td>
                                            <td>{a.note || '-'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Styling definitions
const dashboardWrapper = {
    paddingTop: '40px',
    paddingBottom: '80px',
};

const headerSection = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
};

const statsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '32px',
};

const statCard = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
};

const statIconWrapper = (color) => ({
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: `rgba(${color.includes('purple') ? '139,92,246' : color.includes('green') ? '16,185,129' : '59,130,246'}, 0.1)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const statLabel = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    display: 'block',
};

const statValue = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
};

const mainContentGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '24px',
};

const leftColStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
};

const rightColStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
};

const profileCardStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
};

const profileHeader = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
};

const avatarStyle = {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.1)',
};

const avatarImgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
};

const profileName = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
};

const profileEmail = {
    fontSize: '13px',
    color: 'var(--text-secondary)',
};

const divider = {
    height: '1px',
    background: 'var(--border-color)',
};

const profileDetails = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
};

const detailRow = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
};

const detailLabel = {
    color: 'var(--text-secondary)',
};

const detailVal = {
    color: '#fff',
    fontWeight: '500',
};

const sectionTitleStyle = {
    fontSize: '18px',
    color: '#fff',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
};

const scheduleListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
};

const daySectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
};

const dayNameStyle = {
    fontSize: '13px',
    textTransform: 'uppercase',
    color: 'var(--accent-blue)',
    fontWeight: '700',
    letterSpacing: '0.05em',
};

const dayLessonsContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
};

const lessonCardStyle = {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
};

const lessonMetaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
};

const lessonTimeStyle = {
    fontWeight: '600',
};

const lessonRoomStyle = {
    color: 'var(--text-muted)',
};

const lessonSubjectStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
};

const subjectGradesListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
};

const subjectGradeRowStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
};

const subjectRowHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const subjectNameStyle = {
    fontWeight: '600',
    fontSize: '15px',
    color: '#fff',
};

const subjectAvgStyle = {
    fontSize: '12px',
};

const badgeContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
};

const gradeBadgeStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    cursor: 'help',
    transition: 'border-color 0.2s',
};

const gradeScoreStyle = {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--accent-purple)',
};

const gradeDateStyle = {
    fontSize: '9px',
    color: 'var(--text-muted)',
};

const attendanceSummaryGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
};

const attendanceSumItem = (color) => ({
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
});

const sumVal = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
};

const sumLabel = {
    fontSize: '11px',
    color: 'var(--text-secondary)',
};

const noDataText = {
    color: 'var(--text-muted)',
    fontSize: '14px',
};

const centeredContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 24px',
};
