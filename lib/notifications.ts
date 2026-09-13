type BookingNotice = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredDate: string;
  alternativeDate: string | null;
  groupSize: number;
  occasionType: string | null;
  message: string | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) return;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!response.ok) console.error('Booking email could not be sent', response.status);
}

export async function sendBookingNotifications(booking: BookingNotice) {
  const guideEmail = process.env.GUIDE_EMAIL;
  const date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'Europe/London' }).format(new Date(`${booking.preferredDate}T12:00:00Z`));
  const safeName = escapeHtml(booking.customerName);
  const tasks = [
    sendEmail(
      booking.customerEmail,
      'Thanks for your River Wey enquiry',
      `<h1>Thanks for your River Wey enquiry</h1><p>We have your request for ${escapeHtml(date)} for ${booking.groupSize} guests.</p><p>Your day is not yet confirmed. The guide will be in touch to confirm availability and the details.</p>`,
    ),
  ];
  if (guideEmail) {
    tasks.push(sendEmail(
      guideEmail,
      `New River Wey enquiry — ${booking.groupSize} guests — ${date}`,
      `<h1>New River Wey enquiry</h1><p><strong>${safeName}</strong><br>${booking.groupSize} guests<br>${escapeHtml(date)}${booking.alternativeDate ? `<br>Alternative: ${escapeHtml(booking.alternativeDate)}` : ''}</p><p>${escapeHtml(booking.customerPhone)}<br>${escapeHtml(booking.customerEmail)}</p>${booking.message ? `<p>${escapeHtml(booking.message)}</p>` : ''}<p><a href="https://thecanoewey.co.uk/admin">View bookings</a></p>`,
    ));
  }
  await Promise.allSettled(tasks);
}
