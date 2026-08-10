"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {courseData as lessons} from '../data/courseData.js';
import '.././styles/course.css';
import '.././styles/components/faq.css';
import '.././styles/components/footer.css'; // optional

// --- Lesson data (exactly as in course.js) ---


export default function CoursePage() {
  // --- State for navbar hamburger ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- State for active lesson ---
  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);

  // --- State for FAQ accordion (same pattern as before) ---
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const faqAnswerRefs = useRef([]);

  // --- Toggle hamburger ---
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // --- Navbar scroll effect ---
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- FAQ accordion max-height update ---
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

  // --- FAQ toggle ---
  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  // --- Render active lesson content ---
  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  const pointsMarkup = activeLesson.points.map((point, i) => <li key={i}>{point}</li>);

  // --- Lesson selection handler ---
  const selectLesson = (id) => {
    setActiveLessonId(id);
  };

  return (
    <>
      {/* ========== NAVBAR ========== */}
      <header className="navbar course-navbar" id="navbar">
        <div className="nav-wrapper">
          <Link href="/" className="logo">Евгения Аль Ведьян</Link>

          <nav>
            <ul className={"nav-links"} id="navLinks">
              <li><a href="/#services" >Услуги</a></li>
              <li><a href="/#about" >Обо мне</a></li>
              <li><a href="/#faq" >FAQ</a></li>
              <li><a href="/#contact" >Контакты</a></li>
              <li><Link href="/course" >Курс</Link></li>
            </ul>
          </nav>

          
        </div>
      </header>

      {/* ========== COURSE HEADER ========== */}
      <header className="course-header">
        <div className="container course-header-inner">
          <Link href="/#course" className="back-link">← На главную</Link>

          <div className="course-hero-copy">
            <p className="hero-support">Онлайн-курс</p>
            <h1>ТЕЛО ГОВОРИТ</h1>
            
            <p>Курс по психосоматике для специалистов, работающих с глубинными состояниями человека.</p>

            <p>Бывает, что клиент приходит с болью в спине, а в работе открывается история, которая тянется через всю его жизнь.</p>

            <p>Или вы видите образ, чувствуете сильную эмоцию, замечаете напряжение в теле, но в какой-то момент понимаете: интуиции недостаточно. Не хватает понимания, почему именно этот орган, почему именно этот симптом, почему болезнь проявилась именно сейчас.</p>

            <p>Так постепенно возникает желание глубже понимать язык тела.</p>

            <p>Именно из этого желания родился этот курс.</p>

            <p>Он соединяет психологию, психосоматику и мой многолетний опыт работы в ченнелинге. Не для того, чтобы заменить интуицию знаниями, а для того, чтобы знания стали для неё опорой.</p>

            <p>Мы будем говорить не только о болезнях.</p>

            <p>Мы будем говорить о человеке.</p>

            <p>О том, каким образом жизненная история постепенно становится историей тела.</p>

            <p>О том, почему один и тот же конфликт может проявляться совершенно по-разному.</p>

            <p>И почему иногда тело рассказывает то, о чём человек ещё не готов говорить словами.</p>
          </div>
        </div>
      </header>

      {/* ========== FAQ SECTION ========== */}
      <section id="faq">
        <div className="container">
          <div className="section-intro">
            <h2>Часто задаваемые вопросы</h2>
            <p>Ответы на основные вопросы перед началом терапии.</p>
          </div>

          <div className="faq-container">
            {/* FAQ items – we'll render them from the HTML as static, but with accordion logic */}
            {/* You could also make them dynamic, but they are few, so I'll hardcode them */}
            <div className={`faq-item ${activeFaqIndex === 0 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(0)}>
                <span>Для кого этот курс</span>
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer" ref={(el) => (faqAnswerRefs.current[0] = el)}>
                <div className="faq-answer-content">
                  <p>
                    Этот курс я создавала прежде всего для ченнелеров.<br /><br />
                    Но постепенно поняла, что он оказывается полезен гораздо более широкому кругу специалистов.<br /><br />
                    Он подойдет вам, если вы работаете с человеком через внутренние образы, чувства, медитативные техники, контакт с бессознательным или энергетические практики и хотите глубже понимать язык тела.<br />
                    Возможно, вы:<br />
                    • проводите сессии ченнелинга.<br />
                    • используете медитативные техники в психологическом консультировании.<br />
                    • работаете с подсознанием.<br />
                    • занимаетесь регрессиями.<br />
                    • проводите энергетические практики.<br />
                    • сопровождаете людей в глубинных трансформациях.<br /><br />
                    Во всех этих направлениях тело становится важной частью диалога с человеком.<br />
                    И чем лучше специалист понимает этот язык, тем точнее становятся вопросы, спокойнее работа и глубже понимание происходящего
                  </p>
                </div>
              </div>
            </div>

            <div className={`faq-item ${activeFaqIndex === 1 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(1)}>
                <span>Что вы получите</span>
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer" ref={(el) => (faqAnswerRefs.current[1] = el)}>
                <div className="faq-answer-content">
                  <p>
                    После курса вы будете иначе смотреть на симптомы - не как на список диагнозов, а как на часть жизненной истории человека.<br /><br />
                    Вы начнёте увереннее ориентироваться в психосоматических закономерностях разных органов и систем.<br /><br />
                    Перестанете теряться, когда клиент называет диагноз, о котором раньше почти ничего не знали.<br /><br />
                    Научитесь видеть различия между похожими заболеваниями, потому что за похожими симптомами нередко стоят совершенно разные внутренние конфликты.<br />
                    Получите понятную структуру построения сессии:<br />
                    с чего начать работу с клиентом,<br />
                    какие вопросы помогают двигаться глубже,<br />
                    в какой момент стоит остановиться,<br />
                    а где важно направить человека к врачу.<br /><br />
                    И, пожалуй, самое главное.<br />
                    Интуиция никуда не исчезнет, <br />
                    наоборот, она станет точнее.<br />
                    Потому что рядом с ней появится ещё один инструмент — понимание языка тела.<br />
                  </p>
                </div>
              </div>
            </div>

            <div className={`faq-item ${activeFaqIndex === 2 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(2)}>
                <span>О чём этот курс</span>
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer" ref={(el) => (faqAnswerRefs.current[2] = el)}>
                <div className="faq-answer-content">
                  <p>
                    Каждая лекция посвящена одной системе организма.<br /><br />
                    Мы разбираем не только заболевания.<br /><br />
                    Мы исследуем внутреннюю историю органа.<br /><br />
                    Почему именно он оказывается вовлечён.<br /><br />
                    Какие эмоциональные конфликты встречаются чаще всего.<br /><br />
                    Как это проявляется в работе с клиентом.<br /><br />
                    Какие вопросы помогают выйти к сути.<br /><br />
                    Какие ошибки чаще всего совершают специалисты.<br /><br />
                    Каждая тема сопровождается клиническими примерами, психологическими портретами, реальными случаями из практики и разбором методологии работы.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== COURSE SHELL (lessons sidebar + preview) ========== */}
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
            {/* If you want to show cardTitle and cardText, uncomment: */}
            {/* {activeLesson.cardTitle && (
              <div className="lesson-card">
                <h3>{activeLesson.cardTitle}</h3>
                <p>{activeLesson.cardText}</p>
              </div>
            )} */}
          </div>
        </section>
      </main>

      {/* Optional footer – you can copy the same footer from landing if desired */}
      {/* <footer className="site-footer">...</footer> */}
    </>
  );
}