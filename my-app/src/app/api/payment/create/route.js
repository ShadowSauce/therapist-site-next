// pages/api/payment/create.js
//
// POST /api/payment/create
// Body: { bookingId: string, amount: number, description?: string }
//
// Creates a YooKassa payment and returns the checkout URL to redirect the user to.

const { createPayment } = require("../../../lib/yookassa");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bookingId, amount, description } = req.body || {};

  if (!bookingId || !amount) {
    return res.status(400).json({ error: "bookingId and amount are required" });
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  try {
    // TODO: look up the booking in your DB here and use its real price
    // instead of trusting the amount sent from the client, e.g.:
    // const booking = await db.booking.findUnique({ where: { id: bookingId } });
    // if (!booking) return res.status(404).json({ error: "Booking not found" });
    // const parsedAmount = booking.price;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const payment = await createPayment({
      amount: parsedAmount,
      description: description || `Оплата консультации, бронь №${bookingId}`,
      returnUrl: `${siteUrl}/booking/${bookingId}/success`,
      metadata: { bookingId },
    });

    // TODO: persist payment.id against the booking in your DB with status "pending"
    // e.g. await db.booking.update({ where: { id: bookingId }, data: { paymentId: payment.id, status: "pending" } });

    return res.status(200).json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
    });
  } catch (err) {
    console.error("Payment creation failed:", err);
    return res.status(500).json({ error: "Failed to create payment" });
  }
}
