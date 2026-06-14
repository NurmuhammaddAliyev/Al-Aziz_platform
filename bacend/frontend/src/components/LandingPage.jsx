import React, { useState, useEffect } from 'react';
import { Calendar, Award, CheckCircle, ArrowRight, BookOpen, Layers, MessageSquare, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { Api } from '../services/Api';

export default function LandingPage({ onOpenLogin, onOpenRegister, onEnterDashboard, onSelectCourse, user }) {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [faqOpen, setFaqOpen] = useState({});

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const data = await Api.subjects.list();
        // Backend pagination'ni qo'shgan: {count, next, previous, results: [...]}
        // Agar data.results bo'lsa, u array, aks holda data bunaqa array
        const subjectsArray = Array.isArray(data) ? data : (data?.results || []);
        if (subjectsArray.length === 0) {
          setSubjects([
            { id: 1, name: 'Dasturlash va IT', code: 'IT-101', duration_months: 6, monthly_price: 650000 },
            { id: 2, name: 'Matematika', code: 'MATH-202', duration_months: 5, monthly_price: 450000 },
            { id: 3, name: 'Ingliz tili (IELTS)', code: 'ENG-303', duration_months: 8, monthly_price: 550000 },
            { id: 4, name: 'Fizika', code: 'PHYS-404', duration_months: 6, monthly_price: 500000 },
            { id: 5, name: 'Kimyo va Biologiya', code: 'CHEM-505', duration_months: 6, monthly_price: 500000 },
          ]);
        } else {
          setSubjects(subjectsArray);
        }
      } catch (err) {
        console.log('Using static fallback subjects for public landing page');
        setSubjects([
          { id: 1, name: 'Dasturlash va IT', code: 'IT-101', duration_months: 6, monthly_price: 650000 },
          { id: 2, name: 'Matematika', code: 'MATH-202', duration_months: 5, monthly_price: 450000 },
          { id: 3, name: 'Ingliz tili (IELTS)', code: 'ENG-303', duration_months: 8, monthly_price: 550000 },
          { id: 4, name: 'Fizika', code: 'PHYS-404', duration_months: 6, monthly_price: 500000 },
          { id: 5, name: 'Kimyo va Biologiya', code: 'CHEM-505', duration_months: 6, monthly_price: 500000 },
        ]);
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, [user]);

  const toggleFaq = (index) => {
    setFaqOpen({ ...faqOpen, [index]: !faqOpen[index] });
  };

  const faqs = [
    { q: "Al-Aziz platformasida o'qish qanday tashkil etiladi?", a: "Bizda darslar ham oflayn, ham onlayn formatda olib boriladi. O'quvchilar haftalik dars jadvali asosida darslarga qatnashadi va barcha materiallar platformada saqlanadi." },
    { q: "O'zlashtirish va baholarni qanday kuzatish mumkin?", a: "Har bir o'quvchi shaxsiy kabinetiga kirib, fanlar bo'yicha olgan baholarini (5 lik yoki foizli tizimda) va o'qituvchilarning izohlarini real vaqt rejimida ko'ra oladi." },
    { q: "Davomat qanday nazorat qilinadi?", a: "O'qituvchilar dars boshlanishida davomatni platformaga kiritadilar. O'quvchining shaxsiy kabinetida darsda bo'lganlik (Keldi/Kelmadi/Kech qoldi) statusi aks etadi." },
    { q: "Ketma-ket dars qoldirilganda nima bo'ladi?", a: "Platformada avtomatlashtirilgan ogohlantirish tizimi mavjud. Agar o'quvchi ketma-ket 3 ta darsni sababsiz qoldirsa, o'qituvchi va administrator panelida maxsus ogohlantirish (Absence Alert) paydo bo'ladi." },
  ];

  return (
    <div style={landingWrapper}>
      {/* Background radial glow */}
      <div className="bg-radial-glow"></div>
      <div className="bg-grid"></div>

      {/* HERO SECTION */}
      <section id="hero" style={heroSection}>
        <div className="container text-center">
          <div style={heroBadgeStyle}>
            <span style={heroBadgeDot}></span>
            Al-Aziz: Yangi Avlod Ta'lim Tizimi
          </div>
          <h1 style={heroTitle} className="gradient-text">
            Bilim va Kelajakni <br />
            <span style={{ color: 'var(--accent-purple)' }}>Al-Aziz</span> bilan bog'lang
          </h1>
          <p style={heroSub}>
            Davomat nazorati, haftalik dars jadvali, baholash tizimi va tahliliy hisobotlar — barchasi yagona, o'ta zamonaviy platformada.
          </p>
          <div style={heroActions}>
            {user ? (
              <button onClick={onEnterDashboard} className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                Boshqaruv paneliga o'tish <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button onClick={onOpenRegister} className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                  Hozir a'zo bo'lish <ArrowRight size={18} />
                </button>
                <button onClick={onOpenLogin} className="btn-secondary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                  Tizimga kirish
                </button>
              </>
            )}
          </div>

          {/* Premium Preview Mockup Card */}
          <div style={heroMockupContainer}>
            <div className="glass-card" style={mockupCard}>
              <div style={mockupHeader}>
                <div style={mockupDots}>
                  <span style={{ ...mockupDot, background: '#ef4444' }}></span>
                  <span style={{ ...mockupDot, background: '#f59e0b' }}></span>
                  <span style={{ ...mockupDot, background: '#10b981' }}></span>
                </div>
                <div style={mockupTitle}>Al-Aziz Dashboard Preview</div>
              </div>
              <div style={mockupBody}>
                <div style={mockupSidebar}>
                  <div style={mockupSideItemActive}></div>
                  <div style={mockupSideItem}></div>
                  <div style={mockupSideItem}></div>
                </div>
                <div style={mockupContent}>
                  <div style={mockupStatsGrid}>
                    <div style={mockupStat}>
                      <span style={mockupStatLabel}>O'quvchilar</span>
                      <span style={mockupStatVal}>120+</span>
                    </div>
                    <div style={mockupStat}>
                      <span style={mockupStatLabel}>Davomat bugun</span>
                      <span style={{ ...mockupStatVal, color: 'var(--accent-green)' }}>94%</span>
                    </div>
                    <div style={mockupStat}>
                      <span style={mockupStatLabel}>O'rtacha baho</span>
                      <span style={{ ...mockupStatVal, color: 'var(--accent-purple)' }}>4.7</span>
                    </div>
                  </div>
                  <div style={mockupChartContainer}>
                    <div style={mockupChartBarActive}></div>
                    <div style={mockupChartBar}></div>
                    <div style={mockupChartBarActive2}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO FEATURES SECTION */}
      <section id="features" style={sectionPadding}>
        <div className="container">
          <div className="text-center">
            <span className="section-tag">Imkoniyatlar</span>
            <h2 className="section-title gradient-text">Mukammal O'quv Nazorati</h2>
            <p className="section-subtitle">
              Bizning platforma o'quvchilar, o'qituvchilar va ma'murlar uchun barcha qulayliklarni bir joyga jamlagan.
            </p>
          </div>

          <div className="bento-grid">
            {/* Bento item 1 */}
            <div className="glass-card bento-2" style={bentoCard}>
              <div className="card-grid-bg"></div>
              <div style={bentoIconContainer('#8b5cf6')}>
                <Calendar size={22} color="#8b5cf6" />
              </div>
              <h3 style={bentoTitle}>Haftalik Dars Jadvali</h3>
              <p style={bentoText}>
                Studentlar o'z guruhlarining dars jadvalini, fanlarini, dars vaqtlari hamda xonalarini qulay kalendar ko'rinishida kuzatib boradilar.
              </p>
              <div style={bentoSchedulePreview}>
                <div style={scheduleRow}><span>Dushanba:</span> <span>Dasturlash (Xona 102)</span></div>
                <div style={scheduleRow}><span>Chorshanba:</span> <span>Ingliz tili (Xona 204)</span></div>
              </div>
            </div>

            {/* Bento item 2 */}
            <div className="glass-card bento-1" style={bentoCard}>
              <div className="card-grid-bg"></div>
              <div style={bentoIconContainer('#ec4899')}>
                <Award size={22} color="#ec4899" />
              </div>
              <h3 style={bentoTitle}>Baholar Monitoringi</h3>
              <p style={bentoText}>
                Har bir dars bo'yicha baholarni 5 lik yoki foizli ko'rsatkichda kuzatish va o'zlashtirish reytingini tahlil qilish imkoniyati.
              </p>
              <div style={bentoGradeWidget}>
                <span style={bentoGradeValue}>4.82</span>
                <span style={bentoGradeText}>O'rtacha reyting</span>
              </div>
            </div>

            {/* Bento item 3 */}
            <div className="glass-card bento-1" style={bentoCard}>
              <div className="card-grid-bg"></div>
              <div style={bentoIconContainer('#10b981')}>
                <CheckCircle size={22} color="#10b981" />
              </div>
              <h3 style={bentoTitle}>Davomat Nazorati</h3>
              <p style={bentoText}>
                Darslarda qatnashganlik darajasini oson tekshiring. Keldi, kelmadi yoki kech qoldi statuslari avtomatik saqlanadi.
              </p>
              <div style={bentoAttendanceStats}>
                <div style={statCircle}>92%</div>
              </div>
            </div>

            {/* Bento item 4 */}
            <div className="glass-card bento-2" style={bentoCard}>
              <div className="card-grid-bg"></div>
              <div style={bentoIconContainer('#3b82f6')}>
                <Bell size={22} color="#3b82f6" />
              </div>
              <h3 style={bentoTitle}>Avtomatlashtirilgan Ogohlantirishlar</h3>
              <p style={bentoText}>
                Tizim o'quvchi ketma-ket 3 marta dars qoldirganda administrator va o'qituvchilarga zudlik bilan Absence Alert xabarlarini chiqaradi.
              </p>
              <div style={bentoAlertWidget}>
                <div style={alertItem}>
                  <span style={alertDot}></span>
                  <span>Sardor Valiyev (Ketma-ket 3 kun kelmadi)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES SECTION */}
      <section id="courses" style={{ ...sectionPadding, background: 'rgba(5, 5, 8, 0.4)' }}>
        <div className="container">
          <div className="text-center">
            <span className="section-tag">Kurslar</span>
            <h2 className="section-title gradient-text">Bizning Fanlarimiz</h2>
            <p className="section-subtitle">
              Malakali ustozlar tomonidan olib boriladigan va platformamiz orqali boshqariladigan asosiy o'quv fanlari.
            </p>
          </div>

          {loadingSubjects ? (
            <div className="text-center"><span className="spinner"></span></div>
          ) : (
            <div style={coursesGrid}>
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className="glass-card blue-hover"
                  style={courseCardButton}
                  onClick={() => {
                    onSelectCourse(sub);
                  }}
                >
                  <div style={courseIconContainer}>
                    <BookOpen size={24} color="var(--accent-blue)" />
                  </div>
                  <h3 style={courseTitle}>{sub.name}</h3>
                  <div style={courseMeta}>
                    <span style={courseCode}>{sub.code || 'AL-AZIZ'}</span>
                    <span style={courseStatus}>Aktiv</span>
                  </div>
                  <div style={coursePriceRow}>
                    <span style={coursePriceLabel}>Oylik</span>
                    <strong style={coursePriceValue}>
                      {(Number(sub.monthly_price || 0)).toLocaleString('uz-UZ')} so'm
                    </strong>
                  </div>
                  <p style={courseDesc}>
                    Ushbu fan bo'yicha dars jadvali, haftalik baholar va davomat ma'lumotlari talabaning shaxsiy kabinetida muntazam yangilanib boradi.
                  </p>
                  <div style={courseActionRow}>
                    <span style={courseActionText}>{user ? "Kurs ma'lumotlari" : 'Kirish uchun bosing'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" style={sectionPadding}>
        <div className="container">
          <div className="text-center">
            <span className="section-tag">Fikrlar</span>
            <h2 className="section-title gradient-text">O'quvchilarimiz Nima Deyishadi?</h2>
            <p className="section-subtitle">
              Al-Aziz platformasi orqali natijaga erishgan o'quvchilar va ularning ota-onalarining fikrlari.
            </p>
          </div>

          <div style={testimonialsGrid}>
            <div className="glass-card" style={testimonialCard}>
              <div style={starsStyle}>★★★★★</div>
              <p style={testimonialText}>
                "Platforma juda qulay! Haftalik dars jadvalimni va baholarimni telefonda tez ko'rib olaman. Ayniqsa davomat monitoringi ota-onamga ham yoqdi."
              </p>
              <div style={authorStyle}>
                <div style={authorAvatar}>J</div>
                <div>
                  <h4 style={authorName}>Javohir Elmurodov</h4>
                  <span style={authorRole}>IT-Dasturlash o'quvchisi</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={testimonialCard}>
              <div style={starsStyle}>★★★★★</div>
              <p style={testimonialText}>
                "O'g'limning fanlardan olgan baholarini va darsga qatnashishini endi har kuni nazorat qila olaman. Ketma-ket 3 kun kelmaganlar uchun ogohlantirish berish funksiyasi juda ajoyib ishlangan."
              </p>
              <div style={authorStyle}>
                <div style={authorAvatar}>M</div>
                <div>
                  <h4 style={authorName}>Malika Sobirova</h4>
                  <span style={authorRole}>Ota-ona</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={testimonialCard}>
              <div style={starsStyle}>★★★★★</div>
              <p style={testimonialText}>
                "O'qituvchi sifatida davomat va baholarni kiritish men uchun ancha osonlashdi. Excel jadvallaridan butunlay voz kechdik. Platforma dizayni esa juda ajoyib!"
              </p>
              <div style={authorStyle}>
                <div style={authorAvatar}>A</div>
                <div>
                  <h4 style={authorName}>Akmal Rustamov</h4>
                  <span style={authorRole}>Fizika o'qituvchisi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" style={{ ...sectionPadding, background: 'rgba(5, 5, 8, 0.4)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="text-center">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title gradient-text">Ko'p Beriladigan Savollar</h2>
            <p className="section-subtitle">
              Al-Aziz platformasi haqida savollaringiz bormi? Quyidagi javoblar sizga yordam beradi.
            </p>
          </div>

          <div style={faqListStyle}>
            {faqs.map((faq, idx) => (
              <div className="glass-card" key={idx} style={faqItemStyle} onClick={() => toggleFaq(idx)}>
                <div style={faqQuestionStyle}>
                  <span>{faq.q}</span>
                  {faqOpen[idx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {faqOpen[idx] && (
                  <div style={faqAnswerStyle}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={ctaSection}>
        <div className="container text-center" style={ctaContainerStyle}>
          <div style={ctaBackgroundGlow}></div>
          <h2 style={ctaTitle}>Kelajak Ta'limini Hozir Boshlang!</h2>
          <p style={ctaSub}>
            Ro'yxatdan o'ting va Al-Aziz platformasining barcha qulayliklaridan to'liq foydalaning.
          </p>
          <div style={{ zIndex: 2, position: 'relative' }}>
            {user ? (
              <button onClick={onEnterDashboard} className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                Kabinetga Kirish
              </button>
            ) : (
              <button onClick={onOpenRegister} className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                Ro'yxatdan o'tish
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Inline Styles for simplicity & safety. Responsiveness & styling rules will also exist in index.css.
const landingWrapper = {
  width: '100%',
  position: 'relative',
};

const heroSection = {
  padding: '120px 0 80px 0',
  position: 'relative',
  zIndex: 1,
};

const heroBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(139, 92, 246, 0.1)',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  padding: '6px 14px',
  borderRadius: '9999px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#c084fc',
  marginBottom: '28px',
  fontFamily: 'var(--font-body)',
};

const heroBadgeDot = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: 'var(--accent-purple)',
  boxShadow: '0 0 8px var(--accent-purple)',
};

const heroTitle = {
  fontSize: '56px',
  lineHeight: '1.15',
  fontWeight: '800',
  marginBottom: '24px',
  fontFamily: 'var(--font-heading)',
};

const heroSub = {
  fontSize: '18px',
  color: 'var(--text-secondary)',
  maxWidth: '680px',
  margin: '0 auto 40px auto',
  lineHeight: '1.6',
};

const heroActions = {
  display: 'flex',
  justifyContent: 'center',
  gap: '16px',
  flexWrap: 'wrap',
  marginBottom: '60px',
};

const heroMockupContainer = {
  maxWidth: '850px',
  margin: '0 auto',
  position: 'relative',
  padding: '10px',
};

const mockupCard = {
  padding: '0',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'rgba(10, 10, 12, 0.8)',
};

const mockupHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  background: 'rgba(255, 255, 255, 0.02)',
  borderBottom: '1px solid var(--border-color)',
};

const mockupDots = {
  display: 'flex',
  gap: '6px',
};

const mockupDot = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
};

const mockupTitle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
};

const mockupBody = {
  display: 'flex',
  height: '240px',
};

const mockupSidebar = {
  width: '50px',
  background: 'rgba(255, 255, 255, 0.01)',
  borderRight: '1px solid var(--border-color)',
  padding: '15px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
};

const mockupSideItem = {
  width: '20px',
  height: '20px',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.05)',
};

const mockupSideItemActive = {
  ...mockupSideItem,
  background: 'var(--accent-purple)',
  boxShadow: '0 0 10px var(--accent-purple-glow)',
};

const mockupContent = {
  flex: 1,
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const mockupStatsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
};

const mockupStat = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const mockupStatLabel = {
  fontSize: '11px',
  color: 'var(--text-muted)',
};

const mockupStatVal = {
  fontSize: '18px',
  fontWeight: '700',
  marginTop: '4px',
};

const mockupChartContainer = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '16px',
  flex: 1,
  display: 'flex',
  alignItems: 'flex-end',
  gap: '12px',
};

const mockupChartBar = {
  height: '40%',
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '4px',
};

const mockupChartBarActive = {
  ...mockupChartBar,
  height: '70%',
  background: 'linear-gradient(to top, var(--accent-purple), var(--accent-blue))',
};

const mockupChartBarActive2 = {
  ...mockupChartBar,
  height: '55%',
  background: 'linear-gradient(to top, var(--accent-pink), var(--accent-purple))',
};

const sectionPadding = {
  padding: '80px 0',
};

const bentoCard = {
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  minHeight: '260px',
};

const bentoIconContainer = (color) => ({
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: `rgba(${color === '#8b5cf6' ? '139,92,246' : color === '#ec4899' ? '236,72,153' : color === '#10b981' ? '16,185,129' : '59,130,246'}, 0.1)`,
  border: `1px solid rgba(${color === '#8b5cf6' ? '139,92,246' : color === '#ec4899' ? '236,72,153' : color === '#10b981' ? '16,185,129' : '59,130,246'}, 0.2)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '8px',
});

const bentoTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#fff',
  fontFamily: 'var(--font-heading)',
  zIndex: 1,
};

const bentoText = {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
  zIndex: 1,
};

const bentoSchedulePreview = {
  marginTop: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 1,
};

const scheduleRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  background: 'rgba(255,255,255,0.02)',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
};

const bentoGradeWidget = {
  marginTop: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  background: 'rgba(255,255,255,0.02)',
  padding: '16px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  zIndex: 1,
};

const bentoGradeValue = {
  fontSize: '32px',
  fontWeight: '800',
  color: 'var(--accent-pink)',
  textShadow: '0 0 15px rgba(236, 72, 153, 0.3)',
};

const bentoGradeText = {
  fontSize: '12px',
  color: 'var(--text-muted)',
};

const bentoAttendanceStats = {
  marginTop: 'auto',
  display: 'flex',
  justifyContent: 'center',
  padding: '10px',
  zIndex: 1,
};

const statCircle = {
  width: '90px',
  height: '90px',
  borderRadius: '50%',
  border: '6px solid rgba(16, 185, 129, 0.1)',
  borderTopColor: 'var(--accent-green)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: '700',
  color: 'var(--accent-green)',
  textShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
};

const bentoAlertWidget = {
  marginTop: 'auto',
  zIndex: 1,
};

const alertItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'rgba(239, 68, 68, 0.05)',
  border: '1px solid rgba(239, 68, 68, 0.15)',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '12px',
};

const alertDot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'var(--accent-red)',
  animation: 'pulse 1.5s infinite',
};

const coursesGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '24px',
  marginTop: '40px',
};

const courseCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  minHeight: '220px',
};

const courseCardButton = {
  ...courseCard,
  width: '100%',
  textAlign: 'left',
  border: 'none',
  background: 'var(--bg-card)',
  cursor: 'pointer',
  appearance: 'none',
};

const courseIconContainer = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const courseTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#fff',
};

const courseMeta = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '12px',
};

const courseCode = {
  color: 'var(--text-muted)',
  background: 'rgba(255,255,255,0.03)',
  padding: '2px 8px',
  borderRadius: '4px',
};

const courseStatus = {
  color: 'var(--accent-green)',
  fontWeight: '600',
};

const courseDesc = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
};

const coursePriceRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
};

const coursePriceLabel = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
};

const coursePriceValue = {
  fontSize: '14px',
  color: '#fff',
};

const courseActionRow = {
  marginTop: 'auto',
  display: 'flex',
  justifyContent: 'flex-end',
};

const courseActionText = {
  fontSize: '12px',
  color: 'var(--accent-blue)',
  fontWeight: '600',
};

const testimonialsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '24px',
  marginTop: '40px',
};

const testimonialCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const starsStyle = {
  color: 'var(--accent-orange)',
  fontSize: '16px',
};

const testimonialText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: 'var(--text-primary)',
  fontStyle: 'italic',
};

const authorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginTop: 'auto',
};

const authorAvatar = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '14px',
};

const authorName = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#fff',
};

const authorRole = {
  fontSize: '12px',
  color: 'var(--text-muted)',
};

const faqListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '40px',
};

const faqItemStyle = {
  cursor: 'pointer',
  padding: '20px',
};

const faqQuestionStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: '600',
  fontSize: '15px',
  color: '#fff',
};

const faqAnswerStyle = {
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: '1px solid rgba(255,255,255,0.03)',
  fontSize: '14px',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
};

const ctaSection = {
  padding: '100px 0',
  position: 'relative',
};

const ctaContainerStyle = {
  position: 'relative',
  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
  border: '1px solid var(--border-color)',
  borderRadius: '24px',
  padding: '60px 40px',
  overflow: 'hidden',
};

const ctaBackgroundGlow = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  height: '300px',
  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex: 0,
};

const ctaTitle = {
  fontSize: '36px',
  marginBottom: '16px',
  color: '#fff',
  zIndex: 2,
  position: 'relative',
};

const ctaSub = {
  fontSize: '16px',
  color: 'var(--text-secondary)',
  maxWidth: '540px',
  margin: '0 auto 32px auto',
  lineHeight: '1.6',
  zIndex: 2,
  position: 'relative',
};
