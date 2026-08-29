"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { courseData as lessons, courseFaq } from '../data/courseData.js';

import '../styles/course.css';
import '../styles/components/faq.css';
// import '../styles/components/footer.css'; // optional

export default function CoursePage() {
  // ─── Navbar state ───
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ─── Desktop: active lesson state ───
  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);

  // ─── Mobile: expanded lesson state (first lesson expanded by default) ───
  const [expandedLesson, setExpandedLesson] = useState(lessons[0]?.id || null);

  // ─── FAQ state ───
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const faqAnswerRefs = useRef([]);

  // ─── Toggle functions ───
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const selectLesson = (id) => {
    setActiveLessonId(id);
  };

  const toggleLesson = (id) => {
    setExpandedLesson(expandedLesson === id ? null : id);
  };

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  // ─── Get active lesson data for desktop ───
  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  const pointsMarkup = activeLesson.points.map((point, i) => <li key={i}>{point}</li>);

  // ─── Navbar scroll effect ───
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── FAQ max-height update ───
  useEffect(() => {
    faqAnswerRefs.current.forEach((el, idx) => {
      if (!el) return;
      if (activeFaqIndex === idx) {
        el.style.maxHeight = `${el.scrollHeight}px`;
      } else {
        el.style.maxHeight = null;
      }
    });
  }, [activeFaqIndex]);

  return (
    <>
    <div className="course-page-wrapper">
      
      {/* ========== NAVBAR ========== */}
      <header className="navbar course-navbar" id="navbar">
        <div className="nav-wrapper">
          <Link href="/" className="logo">Евгения Аль Ведьян</Link>

          <nav>
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`} id="navLinks">
              <li><a href="/#services" onClick={closeMenu}>Услуги</a></li>
              <li><a href="/#about" onClick={closeMenu}>Обо мне</a></li>
              {/* <li><a href="/#faq" onClick={closeMenu}>FAQ</a></li> */}
              <li><a href="/#contact" onClick={closeMenu}>Контакты</a></li>
              <li><Link href="/course" onClick={closeMenu}>Курс</Link></li>
            </ul>
          </nav>

          <button
            className="hamburger"
            id="hamburger"
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* ========== COURSE HEADER ========== */}
      <header className="course-header">
        <div className="container course-header-inner">
          <Link href="/#course" className="back-link">← На главную</Link>

          <div className="course-hero-copy">
            <p>Онлайн-курс</p>
            <h1>ТЕЛО ГОВОРИТ</h1>
            
            <p className="hero-lead">Курс по психосоматике для специалистов, работающих с глубинными состояниями человека.</p>

            <p>Бывает, что клиент приходит с болью в спине, а в работе открывается история, которая тянется через всю его жизнь. Или вы видите образ, чувствуете сильную эмоцию, замечаете напряжение в теле, но в какой-то момент понимаете: интуиции недостаточно. Не хватает понимания, почему именно этот орган, почему именно этот симптом, почему болезнь проявилась именно сейчас.</p>

            <p>Так постепенно возникает желание глубже понимать язык тела.</p>

            <p className="hero-emphasis">Именно из этого желания родился этот курс.</p>

            <p>Он соединяет психологию, психосоматику и мой многолетний опыт работы в ченнелинге. Не для того, чтобы заменить интуицию знаниями, а для того, чтобы знания стали для неё опорой.</p>

            <div className="hero-stanza">
              <p>Мы будем говорить не только о болезнях.</p>

              <p>Мы будем говорить о человеке.</p>

              <p>О том, каким образом жизненная история постепенно становится историей тела.</p>

              <p>О том, почему один и тот же конфликт может проявляться совершенно по-разному.</p>

              <p>И почему иногда тело рассказывает то, о чём человек ещё не готов говорить словами.</p>
            </div>
          </div>
        </div>
      </header>

      {/* ========== FAQ SECTION ========== */}
      <section id="faq" >
        <div className="container">
          <div className="section-intro">
            <h2>Часто задаваемые вопросы</h2>
            <p>Ответы на основные вопросы перед началом курса.</p>
          </div>

          <div className="faq-container">
            {courseFaq.map((item, idx) => (
              <div
                key={idx}
                className={`faq-item ${activeFaqIndex === idx ? 'active' : ''}`}
              >
                <button className="faq-question" onClick={() => toggleFaq(idx)}>
                  <span>{item.question}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div
                  className="faq-answer"
                  ref={(el) => (faqAnswerRefs.current[idx] = el)}
                >
                  <div
                    className="faq-answer-content"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COURSE SHELL (desktop: sidebar + preview) ========== */}
      <main className="course-shell container">
        <aside className="lesson-sidebar" aria-label="Список модулей курса">
          <div className="sidebar-title">Программа курса</div>
          <div className="lesson-list" id="lessonList">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                className={`lesson-item ${activeLessonId === lesson.id ? 'active' : ''}`}
                type="button"
                onClick={() => selectLesson(lesson.id)}
                aria-pressed={activeLessonId === lesson.id}
              >
                <span className="lesson-number">{lesson.number}</span>
                <span className="lesson-title">{lesson.title}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="lesson-preview" id="lessonPreview" aria-live="polite">
          <div className="lesson-panel active">
            <div className="panel-badge">{activeLesson.badge}</div>
            <h2>{activeLesson.title}</h2>
            {activeLesson.intro && <p>{activeLesson.intro}</p>}
            <ul className="lesson-points">{pointsMarkup}</ul>
          </div>
        </section>
      </main>

      {/* ========== MOBILE ACCORDION (hidden on desktop) ========== */}
      <div className="course-accordion-mobile">
        {/* ─── HEADER ─── */}
        <div className="mobile-accordion-header">
          <h2 className="lessons-title">Программа курса</h2>
          <div className="mobile-divider"></div>
          <p className="mobile-subtitle">Нажмите на модуль, чтобы раскрыть содержание</p>
        </div>

        {/* ─── ACCORDION LIST ─── */}
        <div className="lesson-accordion">
          {lessons.map((lesson) => {
            const isExpanded = expandedLesson === lesson.id;
            return (
              <div key={lesson.id} className={`lesson-accordion-item ${isExpanded ? 'active' : ''}`}>
                <button
                  className="lesson-accordion-header"
                  onClick={() => toggleLesson(lesson.id)}
                  aria-expanded={isExpanded}
                >
                  <span className="lesson-number">{lesson.number}</span>
                  <span className="lesson-title">{lesson.title}</span>
                  <span className="lesson-accordion-icon">{isExpanded ? '−' : '+'}</span>
                </button>
                <div className="lesson-accordion-content">
                  <div className="lesson-accordion-body">
                    <div className="panel-badge">{lesson.badge}</div>
                    {lesson.intro && <p className="lesson-intro">{lesson.intro}</p>}
                    <ul className="lesson-points">
                      {lesson.points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                    {lesson.cardTitle && (
                      <div className="lesson-card">
                        <h3>{lesson.cardTitle}</h3>
                        <p>{lesson.cardText}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── BACK TO TOP BUTTON ─── */}
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Вернуться в начало"
        >
          ↑ Наверх
        </button>
      </div>
      
    </div>
    </>
  );
}