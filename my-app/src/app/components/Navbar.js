"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar({ className = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return undefined;

    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`navbar ${className}`.trim()} id="navbar">
      <div className="nav-wrapper">
        <h3 className="logo">
          <Link href="/" onClick={closeMenu}>Евгения Аль Ведьян</Link>
        </h3>

        <nav>
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><Link href="/#services" onClick={closeMenu}>Услуги</Link></li>
            <li><Link href="/#about" onClick={closeMenu}>Обо мне</Link></li>
            <li><Link href="/#faq" onClick={closeMenu}>Вебинары</Link></li>
            <li><Link href="/#contact" onClick={closeMenu}>Контакты</Link></li>
            <li><Link href="/course" onClick={closeMenu}>Курс</Link></li>
          </ul>
        </nav>

        <button
          type="button"
          className="hamburger"
          aria-label="Открыть меню навигации"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
