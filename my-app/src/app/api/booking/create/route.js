import { NextResponse } from 'next/server';
import { servicesData } from '../../../data/servicesData.js';
import { getSupabase } from '../../../lib/supabase.js';

export async function POST(request) {
  try {
    const { clientName, clientEmail, serviceType } = await request.json();
    const service = servicesData[serviceType];
    const supabase = getSupabase();

    if (!clientName || !clientEmail || !service) {
      return NextResponse.json(
        { error: 'clientName, clientEmail, and a valid serviceType are required' },
        { status: 400 }
      );
    }

    const { data: existingClient, error: clientLookupError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', clientEmail)
      .maybeSingle();

    if (clientLookupError) throw clientLookupError;

    let clientId = existingClient?.id;

    if (!clientId) {
      const { data: newClient, error: clientInsertError } = await supabase
        .from('clients')
        .insert({ name: clientName, email: clientEmail })
        .select('id')
        .single();

      if (clientInsertError) throw clientInsertError;
      clientId = newClient.id;
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: clientId,
        service_type: serviceType,
        amount: service.price,
        duration_minutes: parseInt(service.duration, 10),
        notes: 'Ждёт согласования времени',
      })
      .select('id, amount')
      .single();

    if (bookingError) throw bookingError;

    return NextResponse.json({
      booking,
      serviceName: service.title,
    });
  } catch (error) {
    console.error('Booking creation failed:', error);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'development'
          ? error.message
          : 'Не удалось создать запись',
      },
      { status: 500 }
    );
  }
}
