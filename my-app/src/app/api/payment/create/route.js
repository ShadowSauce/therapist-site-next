import { NextResponse } from 'next/server';

//
// POST /api/payment/create
// Body: { bookingId: string, amount: number, description?: string, paymentMethod?: string }
//
// Creates a YooKassa payment and returns the checkout URL to redirect the user to.

const { createPayment } = require('../../../lib/yookassa');

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingId, amount, description, paymentMethod } = body || {};

    if (!bookingId || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'bookingId and amount are required' },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      );
    }

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
      metadata: { bookingId, paymentMethod: paymentMethod || 'card' },
    });

    // TODO: persist payment.id against the booking in your DB with status "pending"
    // e.g. await db.booking.update({ where: { id: bookingId }, data: { paymentId: payment.id, status: "pending" } });

    return NextResponse.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
    });
  } catch (err) {
    console.error('Payment creation failed:', err);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'development'
          ? err.message
          : 'Failed to create payment',
      },
      { status: 500 }
    );
  }
}
