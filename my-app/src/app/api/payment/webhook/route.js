import { NextResponse } from 'next/server';

//
// YooKassa calls this URL when a payment's status changes.
// Register this URL in your YooKassa dashboard under Settings -> HTTP notifications,
// e.g. https://yourdomain.ru/api/payment/webhook
//
// IMPORTANT: never trust the webhook body's status by itself — anyone can POST
// a fake payload here. Always re-fetch the payment from YooKassa's API to confirm.

const { getPayment } = require('../../../lib/yookassa');

export async function POST(request) {
  try {
    const event = await request.json();
    const paymentId = event?.object?.id;

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment id in notification' }, { status: 400 });
    }

    // Confirm the real status directly from YooKassa, don't trust the payload alone
    const payment = await getPayment(paymentId);
    const bookingId = payment.metadata?.bookingId;

    if (payment.status === "succeeded") {
      // TODO: mark the booking as paid in your DB
      // await db.booking.update({ where: { id: bookingId }, data: { status: "paid" } });
      console.log(`Booking ${bookingId} paid. Payment ${paymentId} succeeded.`);
    } else if (payment.status === "canceled") {
      // TODO: mark the booking as payment failed / release the slot
      // await db.booking.update({ where: { id: bookingId }, data: { status: "payment_failed" } });
      console.log(`Booking ${bookingId} payment canceled. Payment ${paymentId}.`);
    }
    // Other statuses (pending, waiting_for_capture) usually don't need action here
    // since capture: true is set on creation.

    // YooKassa just needs a 200 response to know the notification was received
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error('Webhook handling failed:', err);
    // Still return 200 so YooKassa doesn't hammer retries while you debug,
    // OR return 500 during initial testing so you notice failures. Your call.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
