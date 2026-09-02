/**
 * lib/atolPay.js
 * ─────────────────────────────────────────────────────────────
 * Integration with ATOL Pay (online acquiring / card + SBP payments).
 *
 * ⚠️ VERIFY BEFORE PRODUCTION:
 * ATOL Pay's full API schema is only visible via their gated Swagger docs
 * (https://new-api-mobile.atolpay.ru/v1/ecom/documentation/), unlocked once
 * you have real API credentials from lk.atolpay.ru. This file is built from
 * publicly confirmed facts (base URL, core endpoint, token-based auth,
 * redirect-to-hosted-form flow). Field names marked "VERIFY" below should be
 * checked against your actual sandbox response before going live — test in
 * their sandbox environment first.
 *
 * Flow:
 *   1. createPayment() -> ATOL Pay returns a hosted paymentUrl
 *   2. Redirect the client to paymentUrl to enter card/SBP details
 *   3. ATOL Pay calls your webhook URL when the payment status changes
 *   4. verifyWebhookSignature() + handleWebhookPayload() update your booking
 *
 * Required env vars — see bottom of file for full list.
 */

const ATOL_PAY_BASE_URL =
  process.env.ATOL_PAY_BASE_URL || 'https://new-api-mobile.atolpay.ru/v1/ecom';
const ATOL_PAY_API_TOKEN = process.env.ATOL_PAY_API_TOKEN;
const ATOL_PAY_WEBHOOK_SECRET = process.env.ATOL_PAY_WEBHOOK_SECRET;

if (!ATOL_PAY_API_TOKEN) {
  throw new Error('Missing ATOL_PAY_API_TOKEN environment variable');
}

/**
 * Internal fetch wrapper with auth + error handling.
 */
async function atolFetch(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${ATOL_PAY_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // VERIFY: confirm header name — "Authorization: Bearer <token>" is the
      // pattern used by their Bitrix24/PARTS SOFT integrations, but confirm
      // against your sandbox docs once you have credentials.
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
    // VERIFY exact field names against sandbox — these follow the common
    // shape described in ATOL Pay's ecom integration doc ("Регистрация платежей").
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

  // VERIFY response shape — assuming { id, payment_url } based on the
  // documented flow ("результатом... будет ссылка на платежную форму").
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
 * Fetch current status of a payment directly from ATOL Pay (useful as a
 * fallback / reconciliation check, not just relying on webhooks).
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
 * Verify an incoming webhook actually came from ATOL Pay before trusting it.
 *
 * ⚠️ This is the most important function in this file from a security
 * standpoint, and the one I'm least able to verify without access to their
 * gated docs. DO NOT skip signature verification in production — an
 * unverified webhook means anyone who finds your webhook URL could POST a
 * fake "payment succeeded" event and get a free booking.
 *
 * Common patterns for RU payment providers (YooKassa, Raiffeisen, etc.) are
 * either:
 *   (a) HMAC-SHA256 of the raw body using a shared secret, sent in a header
 *       like X-Api-Signature-SHA256, or
 *   (b) IP allowlisting of ATOL Pay's servers instead of / in addition to a signature.
 *
 * This implementation assumes (a). CONFIRM the actual header name and
 * signing scheme with ATOL Pay support (1@atol.ru) or your sandbox docs
 * before relying on this in production.
 *
 * @param {string} rawBody - the raw, unparsed request body (do NOT use
 *   the already-JSON-parsed body — signatures are computed over raw bytes)
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
 * Parse a verified webhook payload into a normalized shape your app can use
 * to update the booking row.
 *
 * Call this ONLY after verifyWebhookSignature() has returned true.
 *
 * @param {object} payload - parsed JSON body of the webhook
 * @returns {{ bookingId: string, paymentId: string, status: 'paid'|'failed'|'cancelled'|'pending', raw: object }}
 */
function parseWebhookPayload(payload) {
  // VERIFY exact field/status names against real webhook payloads once you
  // can trigger a test payment in sandbox.
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

/**
 * ── ENV VARS NEEDED ──────────────────────────────────────────
 *
 * ATOL_PAY_API_TOKEN       (required) API token from lk.atolpay.ru → Settings → API tokens
 * ATOL_PAY_BASE_URL        (optional) defaults to production ecom API base URL.
 *                          Use their sandbox URL while testing, if they provide one —
 *                          confirm with ATOL Pay support.
 * ATOL_PAY_WEBHOOK_SECRET  (required for webhook verification) shared secret for
 *                          verifying incoming webhook signatures — confirm exact
 *                          provisioning process with ATOL Pay support.
 *
 * On the Supabase/DB side, once a webhook is verified and parsed:
 *   - UPDATE bookings via your SERVICE ROLE key (bypasses RLS), never the anon key
 *   - Only ever transition payment_status using data from a verified webhook
 *     or a direct getPaymentStatus() call — never trust a client-submitted status
 */
