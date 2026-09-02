"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { servicesData } from '../data/servicesData.js';

// Import styles (adjust paths if needed – using @/ alias)
import '../styles/services.css';
import '../styles/components/faq.css';
import '../styles/components/footer.css';

export default function ServiceContent() {
  // ─── Get service from URL query ───
  const searchParams = useSearchParams();
  const serviceKey = searchParams.get('service') || 'individual';
  const serviceData = servicesData[serviceKey] || servicesData.individual;

  // ─── Navbar state ───
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ─── FAQ state ───
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const faqAnswerRefs = useRef([]);

  // ─── Toggle functions ───
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

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

  // ─── FAQ max‑height update ───
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

  // ─── Render ───
  return (
    <div className="services-page">
      {/* ========== NAVIGATION ========== */}
      <header className="navbar" id="navbar">
        <div className="nav-wrapper">
          <h3 className="logo">
            <Link href="/">Евгения Аль Ведьян</Link>
          </h3>

          <nav>
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`} id="navLinks">
              <li><a href="/#services" onClick={closeMenu}>Услуги</a></li>
              <li><a href="/#about" onClick={closeMenu}>Обо мне</a></li>
              <li><a href="/#faq" onClick={closeMenu}>FAQ</a></li>
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

      {/* ========== SERVICE CONTENT ========== */}
      <div className="container">
        <Link href="/#services" className="back-link">← На главную</Link>

        <h1 id="title">{serviceData.title}</h1>

        <div className="meta-row">
          <div className="item"><span>Длительность:</span> <strong id="duration">{serviceData.duration}</strong></div>
          <div className="item"><span>Формат:</span> <strong id="format">{serviceData.format}</strong></div>
          <div className="item"><span>Price:</span> <strong id="price">{serviceData.price}</strong></div>
        </div>

        <div
          className="description"
          id="desc"
          dangerouslySetInnerHTML={{ __html: serviceData.desc }}
        />

        <Link
          href={`/book?service=${serviceKey}`}
          className="book-cta"
        >
          {serviceKey === 'professional' ? 'Стать участником Студии' : 'Записаться на консультацию'}
        </Link>

        {/* ========== FAQ ========== */}
        <div className="faq-container">
          <h2>Часто задаваемые вопросы</h2>
          <p className="sub">Всё, что важно знать перед началом работы.</p>
          <div id="faq-list">
            {serviceData.faq.map((item, idx) => (
              <div
                key={idx}
                className={`faq-item ${activeFaqIndex === idx ? 'active' : ''}`}
              >
                <button
                  className="faq-question"
                  type="button"
                  onClick={() => toggleFaq(idx)}
                >
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
      </div>

      {/* ========== FOOTER ========== */}
      <footer className="site-footer">
        <div className="container">
          <p>
            Иногда ответ находится гораздо ближе, чем кажется.
            Нужно лишь посмотреть на свою историю немного иначе.
            Если вы чувствуете, что пришло время разобраться в том, что происходит в вашей жизни, — я буду рада пройти этот путь вместе с вами.
          </p>
          <p>
            Я не разделяю человека на психику, тело и духовный опыт. Поэтому в своей работе соединяю психологию, психосоматику и, при необходимости, ченнелинг. Не как три отдельных метода, а как разные способы увидеть одну историю целиком.
          </p>
        </div>
      </footer>
    </div>
  );
}