const ATOL_PAY_BASE_URL = process.env.ATOL_PAY_BASE_URL || 'https://new-api-mobile.atolpay.ru/v1/ecom';
const ATOL_PAY_API_TOKEN = process.env.ATOL_PAY_API_TOKEN;
const ATOL_PAY_WEBHOOK_SECRET = process.env.ATOL_PAY_WEBHOOK_SECRET;

if (!ATOL_PAY_API_TOKEN) {
  throw new Error('Missing ATOL_PAY_API_TOKEN environment variable');
}

async function atolFetch(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${ATOL_PAY_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ATOL_PAY_API_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(
      `ATOL Pay API error ${res.status}: ${
        typeof data === 'object' ? JSON.stringify(data) : data
      }`
    );
    err.status = res.status;
    err.response = data;
    throw err;
  }

  return data;
}

/**
 * Create a payment and get back a hosted payment-form URL to redirect the
 * client to.
 *
 * @param {Object} params
 * @param {string} params.bookingId - your internal booking UUID (used as the
 *   external order id so you can reconcile webhooks back to a booking)
 * @param {number} params.amount - amount in RUBLES (not kopecks) — VERIFY:
 *   confirm whether their API expects a decimal string ("2500.00") or a
 *   number; this assumes decimal string, which is the common RU-market convention.
 * @param {string} params.description - shown to the customer on the payment form
 * @param {string} [params.clientEmail] - for the receipt / payment confirmation email
 * @param {string} [params.returnUrl] - where to send the customer after paying
 * @returns {Promise<{ paymentId: string, paymentUrl: string, raw: object }>}
 */

async function createPayment({
  bookingId,
  amount,
  description,
  clientEmail,
  returnUrl,
}) {
  if (!bookingId) throw new Error('createPayment: bookingId is required');
  if (!amount || amount <= 0) throw new Error('createPayment: amount must be > 0');

  const payload = {
    order_id: bookingId,
    amount: amount.toFixed(2),
    currency: 'RUB',
    description: description || `Оплата брони ${bookingId}`,
    email: clientEmail || undefined,
    return_url: returnUrl || undefined,
  };

  const data = await atolFetch('/payments', {
    method: 'POST',
    body: payload,
  });

  const paymentId = data?.id ?? data?.payment_id;
  const paymentUrl = data?.payment_url ?? data?.paymentUrl ?? data?.url;

  if (!paymentId || !paymentUrl) {
    throw new Error(
      `createPayment: unexpected ATOL Pay response shape: ${JSON.stringify(data)}`
    );
  }

  return { paymentId, paymentUrl, raw: data };
}

/**
 *
 * @param {string} paymentId
 */
async function getPaymentStatus(paymentId) {
  if (!paymentId) throw new Error('getPaymentStatus: paymentId is required');

  // VERIFY exact path — assumed REST convention GET /payments/{id}
  const data = await atolFetch(`/payments/${encodeURIComponent(paymentId)}`);
  return data;
}

/**
 *
 * @param {string} rawBody - the raw, unparsed request body (do NOT use
 * @param {string} signatureHeader - value of the signature header from the request
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!ATOL_PAY_WEBHOOK_SECRET) {
    throw new Error('Missing ATOL_PAY_WEBHOOK_SECRET environment variable');
  }
  if (!signatureHeader) return false;

  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', ATOL_PAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  // Constant-time comparison to avoid timing attacks
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 *
 * @param {object} payload - parsed JSON body of the webhook
 * @returns {{ bookingId: string, paymentId: string, status: 'paid'|'failed'|'cancelled'|'pending', raw: object }}
 */
function parseWebhookPayload(payload) {
  const bookingId = payload?.order_id ?? payload?.orderId;
  const paymentId = payload?.id ?? payload?.payment_id;
  const rawStatus = (payload?.status ?? '').toLowerCase();

  const statusMap = {
    succeeded: 'paid',
    success: 'paid',
    paid: 'paid',
    failed: 'failed',
    error: 'failed',
    cancelled: 'cancelled',
    canceled: 'cancelled',
    pending: 'pending',
  };

  return {
    bookingId,
    paymentId,
    status: statusMap[rawStatus] || 'pending',
    raw: payload,
  };
}

module.exports = {
  createPayment,
  getPaymentStatus,
  verifyWebhookSignature,
  parseWebhookPayload,
};