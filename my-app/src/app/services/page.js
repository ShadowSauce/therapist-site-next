"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { servicesData } from '../data/serviceData.js'; // Import the data object


// Import global styles (make sure these files exist)
import '.././styles/services.css';
import '.././styles/components/faq.css';
import '.././styles/components/footer.css';

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const serviceKey = searchParams.get('service') || 'individual';

  // --- Get the current service data ---

const serviceData = servicesData[serviceKey] || servicesData.individual;

  // --- FAQ accordion state ---
  const [activeIndex, setActiveIndex] = useState(null);
  const answerRefs = useRef([]);

  // Toggle FAQ item
  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Update max-height when activeIndex changes
  useEffect(() => {
    answerRefs.current.forEach((el, idx) => {
      if (!el) return;
      if (activeIndex === idx) {
        el.style.maxHeight = `${el.scrollHeight}px`;
      } else {
        el.style.maxHeight = null;
      }
    });
  }, [activeIndex]);

  return (
    <div className="services-page">
    <div className="container">
      {/* Back link */}
      <Link href="/" className="back-link">← На главную</Link>

      {/* Service content */}
      <h1 id="title">{serviceData.title}</h1>

      <div className="meta-row">
        <div className="item"><span>Длительность:</span> <strong id="duration">{serviceData.duration}</strong></div>
        <div className="item"><span>Формат:</span> <strong id="format">{serviceData.format}</strong></div>
      </div>

      <div className="description" id="desc" dangerouslySetInnerHTML={{ __html: serviceData.desc }} />

      <Link href="/#contact" className="book-cta">Записаться на консультацию</Link>

      {/* FAQ */}
      <div className="faq-container">
        <h2>Часто задаваемые вопросы</h2>
        <p className="sub">Всё, что важно знать перед началом работы.</p>
        <div id="faq-list">
          {serviceData.faq.map((item, idx) => (
            <div
              key={idx}
              className={`faq-item ${activeIndex === idx ? 'active' : ''}`}
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
                ref={(el) => (answerRefs.current[idx] = el)}
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

      {/* Footer (same as landing) */}
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
    </div>
  );
}