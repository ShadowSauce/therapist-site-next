"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { servicesData } from '../data/servicesData.js';
import Navbar from '../components/Navbar';
import '../styles/book.css';

const services = Object.entries(servicesData).map(([value, service]) => ({
  value,
  name: service.title,
  price: service.price,
  duration: service.duration,
}));

export default function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceType = searchParams.get('service') || 'individual';
  const initialServiceType = services.some(({ value }) => value === serviceType)
    ? serviceType
    : services[0].value;

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    paymentMethod: 'card', // default
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState(initialServiceType);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
  const serviceDropdownRef = useRef(null);

  const service = services.find(({ value }) => value === selectedServiceType) || services[0];
  const serviceOptions = services.filter(({ value }) => value !== selectedServiceType);

  useEffect(() => {
    if (!serviceMenuOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!serviceDropdownRef.current?.contains(event.target)) {
        setServiceMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setServiceMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [serviceMenuOpen]);

  // ─── Payment method options ───
  const paymentMethods = [
    { value: 'card', label: 'Банковская карта (Visa/Mastercard/MIR)' },
    { value: 'sbp', label: 'СБП (по QR-коду)' },
    { value: 'pay1', label: 'pay1' },
    { value: 'pay2', label: 'pay2' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bookingResponse = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          serviceType: selectedServiceType,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || 'Не удалось создать запись');
      }

      // Create payment after the booking has been created on the server.
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingData.booking.id,
          amount: bookingData.booking.amount,
          description: `${service.name} — ${formData.clientName}`,
          paymentMethod: formData.paymentMethod, // ← pass payment method
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Payment creation failed');

      // 4. Redirect to YooKassa/ATOL checkout
      window.location.href = data.confirmationUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <Navbar />

      <div className="booking-container">
        <Link
          href="/#services"
          onClick={(event) => {
            event.preventDefault();
            router.back();
          }}
          className="booking-back"
        >
          ← Назад к услугам
        </Link>

        <div className="booking-header">
          <h1>Запись на консультацию</h1>
          <p className="booking-subtitle">
            После оплаты мы свяжемся с вами по email, чтобы выбрать удобное время для сессии.
          </p>
        </div>

        <div className="booking-service-dropdown" ref={serviceDropdownRef}>
          <button
            type="button"
            className="booking-service-summary"
            onClick={() => setServiceMenuOpen(!serviceMenuOpen)}
            aria-expanded={serviceMenuOpen}
            aria-haspopup="listbox"
          >
            <span className="service-info">
              <span className="service-label">Услуга</span>
              <strong>{service.name}</strong>
              <span className="service-meta">{service.duration}</span>
            </span>
            <span className="service-price-row">
              <span className="service-price">{service.price.toLocaleString()} ₽</span>
              <span className="service-chevron" aria-hidden="true">⌄</span>
            </span>
          </button>

          {serviceMenuOpen && (
            <div className="service-options" role="listbox" aria-label="Выберите услугу">
              {serviceOptions.map((option) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === selectedServiceType}
                  className="service-option"
                  key={option.value}
                  onClick={() => {
                    setSelectedServiceType(option.value);
                    setServiceMenuOpen(false);
                  }}
                >
                  <span className="service-info">
                    <strong>{option.name}</strong>
                    <span className="service-meta">{option.duration}</span>
                  </span>
                  <span className="service-price">{option.price.toLocaleString()} ₽</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="clientName">Ваше имя *</label>
            <input
              type="text"
              id="clientName"
              required
              placeholder="Евгения"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientEmail">Email *</label>
            <input
              type="email"
              id="clientEmail"
              required
              placeholder="example@mail.ru"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            />
          </div>

          {/* ─── PAYMENT METHOD ─── */}
          <div className="form-group">
            <label>Способ оплаты *</label>
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <label key={method.value} className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={formData.paymentMethod === method.value}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                  />
                  <span>{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group agreements-group">
            <label>Согласия *</label>
            {[
              ['personalData', 'Согласен(а) на обработку персональных данных'],
              ['consultation', 'Согласен(а) с условиями консультации'],
              ['cancellation', 'Согласен(а) с правилами отмены и переноса'],
            ].map(([name, label]) => (
              <label key={name} className="agreement-option">
                <input
                  type="checkbox"
                  required
                  checked={formData[name] || false}
                  onChange={(e) => setFormData({ ...formData, [name]: e.target.checked })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="booking-submit" disabled={loading}>
            {loading ? 'Обработка...' : `Оплатить ${service.price.toLocaleString()} ₽`}
          </button>

          <button
            type="button"
            className="booking-test-button"
            onClick={() => router.push('/booking/test/success')}
          >
            Test
          </button>

          <p className="booking-legal">
            Нажимая «Оплатить», вы соглашаетесь с условиями обработки данных.
            Мы свяжемся с вами по email для согласования времени.
          </p>
        </form>
      </div>
    </div>
  );
}