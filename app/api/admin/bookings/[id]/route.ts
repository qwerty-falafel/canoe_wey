import { isAdminRequest, sameOrigin } from '@/lib/admin-auth';
import { BookingStatus, getAdminServerClient } from '@/lib/supabase';

const statuses: BookingStatus[] = ['NEW', 'CONTACTED', 'CONFIRMED', 'DECLINED', 'CANCELLED', 'COMPLETED'];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!(await isAdminRequest(request))) return Response.json({ error: 'Authentication required.' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { status?: unknown; adminNotes?: unknown };
  if (typeof body.status !== 'string' || !statuses.includes(body.status as BookingStatus) || typeof body.adminNotes !== 'string' || body.adminNotes.length > 5000) {
    return Response.json({ error: 'Invalid booking update.' }, { status: 400 });
  }
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'Invalid booking.' }, { status: 400 });
  const { data, error } = await getAdminServerClient().from('bookings').update({ status: body.status, admin_notes: body.adminNotes.trim() || null }).eq('id', id).select('*').single();
  if (error) return Response.json({ error: 'Booking could not be updated.' }, { status: 500 });
  return Response.json({ booking: data });
}
