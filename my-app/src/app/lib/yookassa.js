// lib/yookassa.js
//
// Minimal wrapper around the YooKassa REST API (https://yookassa.ru/developers/api).
// No extra npm package needed — plain fetch + Basic Auth is enough.

const crypto = require("crypto");

const YOOKASSA_API_URL = "https://api.yookassa.ru/v3";

function getAuthHeader() {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    throw new Error(
      "Missing YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY environment variables"
    );
  }

  const encoded = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
  return `Basic ${encoded}`;
}

/**
 * Creates a payment and returns the YooKassa payment object,
 * including confirmation.confirmation_url — redirect the user there.
 *
 * @param {Object} params
 * @param {number} params.amount - amount in RUB, e.g. 2500 (rubles, not kopecks)
 * @param {string} params.description - shown to the client on the checkout page
 * @param {string} params.returnUrl - where YooKassa sends the user back after paying
 * @param {Object} [params.metadata] - any extra data you want attached to the payment
 *   (e.g. bookingId) so the webhook can find the right booking later.
 * @param {string} [params.idempotenceKey] - defaults to a random UUID.
 */
async function createPayment({
  amount,
  description,
  returnUrl,
  metadata = {},
  idempotenceKey,
}) {
  const key = idempotenceKey || crypto.randomUUID();

  const res = await fetch(`${YOOKASSA_API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      "Idempotence-Key": key,
    },
    body: JSON.stringify({
      amount: {
        value: amount.toFixed(2),
        currency: "RUB",
      },
      capture: true, // auto-capture, no separate confirm step needed
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
      description,
      metadata,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`YooKassa createPayment failed: ${res.status} ${errBody}`);
  }

  return res.json();
}

/**
 * Fetches the current state of a payment directly from YooKassa.
 * Always use this to confirm status inside the webhook handler —
 * never trust the webhook payload's status field on its own.
 */
async function getPayment(paymentId) {
  const res = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`YooKassa getPayment failed: ${res.status} ${errBody}`);
  }

  return res.json();
}

module.exports = { createPayment, getPayment };
