import { isAdminRequest } from '@/lib/admin-auth';
import { getAdminServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: 'Authentication required.' }, { status: 401 });
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter') || 'upcoming';
  const search = (url.searchParams.get('search') || '').trim().slice(0, 100);
  const today = new Date().toISOString().slice(0, 10);
  let query = getAdminServerClient().from('bookings').select('*').order('preferred_date', { ascending: true }).limit(250);
  if (filter === 'upcoming') query = query.gte('preferred_date', today).not('status', 'in', '(DECLINED,CANCELLED,COMPLETED)');
  if (filter === 'new') query = query.eq('status', 'NEW');
  if (filter === 'confirmed') query = query.eq('status', 'CONFIRMED').gte('preferred_date', today);
  if (filter === 'past') query = query.lt('preferred_date', today);
  if (search) query = query.or(`customer_name.ilike.%${search.replace(/[,%()]/g, '')}%,customer_email.ilike.%${search.replace(/[,%()]/g, '')}%,customer_phone.ilike.%${search.replace(/[,%()]/g, '')}%`);
  const { data, error } = await query;
  if (error) return Response.json({ error: 'Bookings could not be loaded.' }, { status: 500 });
  return Response.json({ bookings: data }, { headers: { 'Cache-Control': 'no-store' } });
}
