import { sendBookingNotifications } from '@/lib/notifications';
import { sameOrigin } from '@/lib/admin-auth';
import { getAdminServerClient } from '@/lib/supabase';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const allowedOccasions = new Set(['family', 'couple', 'friends', 'celebration', 'corporate', 'other']);
const attempts = new Map<string, number[]>();

function tooManyRequests(request: Request) {
  const address = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const cutoff = Date.now() - 60 * 60 * 1000;
  const recent = (attempts.get(address) || []).filter((time) => time > cutoff);
  recent.push(Date.now());
  attempts.set(address, recent);
  if (attempts.size > 500) attempts.clear();
  return recent.length > 5;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (tooManyRequests(request)) return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const text = (key: string) => typeof body[key] === 'string' ? body[key].trim() : '';
    if (text('website')) return Response.json({ ok: true }, { status: 201 });

    const customerName = text('customerName');
    const customerEmail = text('customerEmail').toLowerCase();
    const customerPhone = text('customerPhone');
    const preferredDate = text('preferredDate');
    const alternativeDate = text('alternativeDate') || null;
    const groupSize = Number(body.groupSize);
    const occasionType = text('occasionType') || null;
    const companyName = occasionType === 'corporate' ? text('companyName') || null : null;
    const message = text('message') || null;

    if (
      text('consent') !== 'yes' || !customerName || customerName.length > 120 ||
      !emailPattern.test(customerEmail) || customerEmail.length > 254 ||
      !customerPhone || customerPhone.length > 40 || !datePattern.test(preferredDate) ||
      (alternativeDate && !datePattern.test(alternativeDate)) ||
      !Number.isInteger(groupSize) || groupSize < 2 || groupSize > 12 ||
      (occasionType && !allowedOccasions.has(occasionType)) ||
      (companyName && companyName.length > 160) || (message && message.length > 3000)
    ) {
      return Response.json({ error: 'Please check the required details and try again.' }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (preferredDate < today || (alternativeDate && alternativeDate < today)) {
      return Response.json({ error: 'Please choose a date in the future.' }, { status: 400 });
    }

    const booking = { customerName, customerEmail, customerPhone, preferredDate, alternativeDate, groupSize, occasionType, companyName, message };
    const { error } = await getAdminServerClient().from('bookings').insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      preferred_date: preferredDate,
      alternative_date: alternativeDate,
      group_size: groupSize,
      occasion_type: occasionType,
      company_name: companyName,
      message,
      status: 'NEW',
    });
    if (error) throw error;
    await sendBookingNotifications(booking);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Booking submission failed', error instanceof Error ? error.message : error);
    return Response.json({ error: 'Something went wrong and your enquiry hasn’t been sent. Please try again.' }, { status: 500 });
  }
}
