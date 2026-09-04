// src/app/booking/[id]/success/page.js
"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import '../../../styles/success.css';

export default function BookingSuccessPage() {
  const params = useParams();
  const bookingId = params?.id || 'вашей записи';

  return (
    <main className="success-page">
      <section className="success-card" aria-labelledby="success-title">
        <div className="success-mark" aria-hidden="true">✓</div>
        <p className="success-eyebrow">Оплата успешно прошла</p>
        <h1 className="success-title" id="success-title">Оплата подтверждена</h1>
        <p className="success-booking">
          Номер заявки: <strong>{bookingId}</strong>
        </p>
        <p className="success-note">
          Чек об оплате отправлен на вашу электронную почту. Мы свяжемся с вами в ближайшее время, чтобы согласовать детали консультации.
        </p>
        <Link href="/" className="success-home-link">
          Вернуться на главную
        </Link>
      </section>
    </main>
  );
}