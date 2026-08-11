// src/app/booking/[id]/success/page.js
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BookingSuccessPage() {
  const params = useParams();
  const bookingId = params?.id || 'вашей записи';
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      background: '#FAF8F5',
    }}>
      <div style={{
        maxWidth: '500px',
        background: '#ffffff',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2rem',
          marginBottom: '16px',
        }}>
          ✅ Оплата прошла успешно!
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#666B67',
          marginBottom: '8px',
        }}>
          Бронь №{bookingId} подтверждена.
        </p>
        <p style={{
          fontSize: '1rem',
          color: '#666B67',
          marginBottom: '24px',
        }}>
          Мы отправили подтверждение на вашу почту и свяжемся с вами в ближайшее время.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: '#A9B7A1',
            color: '#ffffff',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: '0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = '#8FA68A'}
          onMouseLeave={(e) => e.target.style.background = '#A9B7A1'}
        >
          Вернуться на главную
        </Link>
        <p style={{
          fontSize: '0.9rem',
          color: '#999',
          marginTop: '16px',
        }}>
          Перенаправление через {countdown} сек...
        </p>
      </div>
    </div>
  );
}