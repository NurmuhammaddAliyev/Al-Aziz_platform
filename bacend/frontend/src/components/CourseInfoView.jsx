import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CreditCard,
  Clock3,
  PhoneCall,
  UserRound,
} from 'lucide-react';
import { Api } from '../services/Api';

export default function CourseInfoView({ course, user, onBack, onOpenLogin }) {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [enrollmentState, setEnrollmentState] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  const monthlyPrice = Number(course?.monthly_price || 0);
  const totalPrice = monthlyPrice * Number(course?.duration_months || 0);
  const teacherName = course?.teacher_name || 'Aniqlanmagan';
  const teacherPhone = course?.teacher_phone || 'Kiritilmagan';

  const handleEnroll = async () => {
    if (!user) {
      onOpenLogin();
      return;
    }

    setIsSubmitting(true);
    setEnrollmentState({ text: '', type: '' });
    try {
      await Api.enrollments.create({
        subject: course.id,
        phone: contactPhone.trim(),
      });
      setEnrollmentState({
        text: "Kursga yozilish so'rovi yuborildi. Admin tasdiqlashini kuting.",
        type: 'success',
      });
    } catch (err) {
      setEnrollmentState({
        text: err.message || 'Kursga yozilishda xatolik yuz berdi.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function loadSchedule() {
      if (!course?.id) {
        setScheduleItems([]);
        return;
      }

      setLoadingSchedule(true);
      try {
        const allSchedules = await Api.schedule.list();
        const filtered = Array.isArray(allSchedules)
          ? allSchedules.filter(item => Number(item.subject) === Number(course.id) && item.is_active !== false)
          : [];
        setScheduleItems(filtered);
      } catch (err) {
        setScheduleItems([]);
      } finally {
        setLoadingSchedule(false);
      }
    }

    loadSchedule();
  }, [course?.id]);

  useEffect(() => {
    setContactPhone(user?.phone || '');
  }, [user?.phone]);

  const weekdayNames = useMemo(() => ({
    monday: 'Dushanba',
    tuesday: 'Seshanba',
    wednesday: 'Chorshanba',
    thursday: 'Payshanba',
    friday: 'Juma',
    saturday: 'Shanba',
    sunday: 'Yakshanba',
  }), []);

  return (
    <div style={pageWrapper}>
      <div className="container" style={pageInner}>
        <button type="button" className="btn-secondary" onClick={onBack} style={backButton}>
          <ArrowLeft size={16} />
          Kurslar
        </button>

        <div className="glass-card" style={heroCard}>
          <div style={heroTop}>
            <div style={iconBox}>
              <BookOpen size={24} color="var(--accent-blue)" />
            </div>
            <div>
              <span className="section-tag">Kurs ma'lumoti</span>
              <h1 style={title}>{course?.name || 'Kurs'}</h1>
              <p style={subtitle}>
                {course?.code || 'AL-AZIZ'} kodli kurs. Davomat, baholar va jadval shu kurs bo'yicha yuritiladi.
              </p>
            </div>
          </div>

          <div style={infoGrid}>
            <div className="glass-card" style={infoCard}>
              <CalendarDays size={18} color="var(--accent-purple)" />
              <span style={label}>Davomiyligi</span>
              <strong style={value}>{course?.duration_months || 0} oy</strong>
            </div>
            <div className="glass-card" style={infoCard}>
              <CreditCard size={18} color="var(--accent-green)" />
              <span style={label}>Oylik narx</span>
              <strong style={value}>{monthlyPrice.toLocaleString('uz-UZ')} so'm</strong>
            </div>
            <div className="glass-card" style={infoCard}>
              <Clock3 size={18} color="var(--accent-pink)" />
              <span style={label}>Umumiy summa</span>
              <strong style={value}>{totalPrice.toLocaleString('uz-UZ')} so'm</strong>
            </div>
            <div className="glass-card" style={infoCard}>
              <UserRound size={18} color="var(--accent-blue)" />
              <span style={label}>Ustoz</span>
              <strong style={value}>{teacherName}</strong>
            </div>
            <div className="glass-card" style={infoCard}>
              <PhoneCall size={18} color="var(--accent-green)" />
              <span style={label}>Aloqa</span>
              <strong style={value}>{teacherPhone}</strong>
            </div>
          </div>

          <div className="glass-card" style={scheduleCard}>
            <h3 style={sectionTitle}>Dars vaqtlari</h3>
            {loadingSchedule ? (
              <p style={mutedText}>Jadval yuklanmoqda...</p>
            ) : scheduleItems.length === 0 ? (
              <p style={mutedText}>Bu kurs uchun hali dars jadvali yo'q.</p>
            ) : (
              <div style={scheduleList}>
                {scheduleItems.map(item => (
                  <div key={item.id} style={scheduleRow}>
                    <div>
                      <strong style={scheduleDay}>{weekdayNames[item.day] || item.day}</strong>
                      <div style={scheduleMeta}>
                        {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)} | Xona {item.room || '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card" style={contactCard}>
            <h3 style={sectionTitle}>Bog'lanish uchun telefon</h3>
            <p style={mutedText}>
              Admin siz bilan shu raqam orqali bog'lanadi. To'g'ri raqam kiriting.
            </p>
            <input
              type="text"
              className="glass-input"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              style={{ marginTop: '12px' }}
            />
          </div>

          <div style={actionRow}>
            <button type="button" className="btn-primary" onClick={handleEnroll} disabled={isSubmitting}>
              {user ? 'Kursga yozilish' : 'Kirish'} <ArrowRight size={16} />
            </button>
          </div>

          {enrollmentState.text && (
            <div
              style={{
                ...enrollmentMessageStyle,
                color: enrollmentState.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)',
                borderColor: enrollmentState.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)',
              }}
            >
              {enrollmentState.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const pageWrapper = {
  padding: '48px 0 80px 0',
};

const pageInner = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const backButton = {
  width: 'fit-content',
};

const heroCard = {
  padding: '28px',
};

const heroTop = {
  display: 'flex',
  gap: '18px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  marginBottom: '24px',
};

const iconBox = {
  width: '52px',
  height: '52px',
  borderRadius: '14px',
  background: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const title = {
  fontSize: '34px',
  lineHeight: 1.2,
  color: '#fff',
  marginBottom: '8px',
};

const subtitle = {
  color: 'var(--text-secondary)',
  maxWidth: '760px',
  fontSize: '15px',
};

const infoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
};

const infoCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '18px',
};

const label = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
};

const value = {
  fontSize: '18px',
  color: '#fff',
};

const actionRow = {
  display: 'flex',
  justifyContent: 'flex-end',
};

const enrollmentMessageStyle = {
  marginTop: '16px',
  padding: '12px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  fontSize: '14px',
};

const scheduleCard = {
  padding: '22px',
  marginBottom: '24px',
};

const contactCard = {
  padding: '22px',
  marginBottom: '24px',
};

const sectionTitle = {
  fontSize: '18px',
  color: '#fff',
  marginBottom: '16px',
};

const scheduleList = {
  display: 'grid',
  gap: '12px',
};

const scheduleRow = {
  padding: '14px 16px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
};

const scheduleDay = {
  display: 'block',
  color: '#fff',
  fontSize: '15px',
  marginBottom: '4px',
};

const scheduleMeta = {
  color: 'var(--text-secondary)',
  fontSize: '13px',
};

const mutedText = {
  color: 'var(--text-secondary)',
  fontSize: '14px',
};
