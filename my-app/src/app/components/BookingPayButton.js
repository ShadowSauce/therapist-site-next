"use client";

import { useState } from "react";

export default function BookingPayButton({ bookingId, amount, description, paymentMethod }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount, description, paymentMethod }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment creation failed");
      }

      // Redirect to YooKassa's hosted checkout page
      window.location.href = data.confirmationUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handlePay} disabled={loading} style={styles.button}>
        {loading ? "Переход к оплате..." : `Оплатить ${amount} ₽`}
      </button>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4a90d9",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "#c0392b",
    marginTop: "8px",
  },
};
