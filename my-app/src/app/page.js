"use client";
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { servicesData } from './data/servicesData.js';

export default function Home() {
  // --- State for Hamburger Menu ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  // --- 1. Navbar scroll effect (exactly like landing.js) ---
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 2. Hamburger toggle & close functions ---
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* ========== NAVIGATION ========== */}
      <header className="navbar" id="navbar">
        <div className="nav-wrapper">
          <h3 className="logo">
            <Link href="/">Евгения Аль Ведьян</Link>
          </h3>

          <nav>
            <ul
              className={`nav-links ${isMenuOpen ? 'active' : ''}`}
              id="navLinks"
            >
              <li><a href="#services" onClick={closeMenu}>Услуги</a></li>
              <li><a href="#about" onClick={closeMenu}>Обо мне</a></li>
              <li><a href="#faq" onClick={closeMenu}>Вебинары</a></li>
              <li><a href="#contact" onClick={closeMenu}>Контакты</a></li>
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

      {/* ========== HERO ========== */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <div className="hero-heading">
              <div className="hero-support">
                Ченнелер · психолог · психосоматолог
              </div>
              <h1>Евгения<br />Аль Ведьян</h1>
            </div>
            <p>
              Помогаю понять истинную причину проблемы и найти путь к её решению.
              Работаю на стыке ченнелинга, психологии и психосоматики — с
              отношениями, тревогой, психосоматическими симптомами и жизненными
              тупиками.
            </p>
          </div>

          <div className="hero-image">
            <img src="/hero_1.jpg" alt="Therapist portrait" />
            <div className="hero-overlay">
              <div className="hero-support">
                Ченнелер · психолог · психосоматолог
              </div>
              <h1>Евгения<br />Аль Ведьян</h1>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES ========== */}
      <section id="services">
        <div className="container">
          <div className="section-intro">
            <h2>Услуги</h2>
          </div>
          <div className="services-grid">
            {Object.entries(servicesData).map(([serviceKey, service]) => (
              <div className="service-card" key={serviceKey}>
                <h3>{service.title}</h3>
                <p className="service-desc">{service.small_des}</p>
                <div className="service-meta">
                  {service.duration}  ·  {service.format}
                </div>
                <Link href={`/services?service=${serviceKey}`} className="book-btn">Подробнее</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COURSE ========== */}
      <section id="course">
        <div className="container">
          <div className="course-wrapper">
            <div className="course-grid">
              <div className="img-placeholder">
              <img src="/course_img.jpg" alt="Course Image body talks"/>
                
              </div>
              <div className="course-content">
                <h2>ТЕЛО ГОВОРИТ</h2>
                <p>
                  Курс по психосоматике для специалистов, работающих с глубинными состояниями человека
                </p>
                <Link href="/course" className="course-button">Подробнее</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ABOUT ========== */}
      <section id="about">
        <div className="container about-grid">
          <div className="about-image">
            <img src="/about_me.jpg" alt="Therapist in calming environment" />
          </div>
          <div className="about-content">
            <h2>Обо Мне</h2>
            <p>
              Я психолог, психосоматолог и практик ченнелинга.
              Я помогаю людям лучше понять себя и увидеть то, что часто остается незамеченным за тревогой, повторяющимися жизненными ситуациями или сложными отношениями. В своей работе я соединяю психологию, психосоматику и ченнелинг. Для меня это не три разных метода, а один путь, который помогает увидеть историю человека целиком, найти глубинные причины происходящего и постепенно прийти к тем изменениям, которых не удавалось достичь раньше.
            </p>
            <div className="credentials">
              <h4>Lorem ipsum dolor sit amet consectetur</h4>
              <p>
                Lorem ipsum dolor sit amet consectetur · 
                Lorem ipsum dolor sit amet consectetur adipisicing elit  ·
                fuga corrupti beatae eligendi exercitationem cum earum · Error recusandae a dolorum labore quos quae
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section id="contact">
        <div className="container">
          <div className="section-intro">
            <h2>Контакты</h2>
            <p>Свяжитесь напрямую для записи на консультацию.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-details">
                <div className="contact-item">
                  <h4>Электронная почта</h4>
                  <p>evgeniaalvedyan@yandex.ru</p>
                </div>
                <div className="contact-item">
                  <h4>Телефон</h4>
                  <p>+7 (916) 500 78 93</p>
                </div>
                <div className="contact-item">
                  <h4>социальные сети</h4>
                  <div className="social-links">
                    <a href="#">Instagram</a>
                    <a href="#">LinkedIn</a>
                    <a href="#">Facebook</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="site-footer">
        <div className="container">
          <p>Иногда ответ находится гораздо ближе, чем кажется.
            Нужно лишь посмотреть на свою историю немного иначе.
            Если вы чувствуете, что пришло время разобраться в том, что происходит в вашей жизни, — я буду рада пройти этот путь вместе с вами.</p>
          <p>Я не разделяю человека на психику, тело и духовный опыт. Поэтому в своей работе соединяю психологию, психосоматику и, при необходимости, ченнелинг. Не как три отдельных метода, а как разные способы увидеть одну историю целиком.</p>
        </div>
      </footer>
    </>
  );
}