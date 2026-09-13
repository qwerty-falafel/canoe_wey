import { isAdminRequest, sameOrigin } from '@/lib/admin-auth';
import { hashSitePassword } from '@/lib/site-access';
import { getAdminServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: 'Authentication required.' }, { status: 401 });
  const { data, error } = await getAdminServerClient()
    .from('site_access_settings')
    .select('access_mode,username,password_hash,updated_at')
    .eq('id', 1)
    .single();
  if (error) return Response.json({ error: 'Site access settings could not be loaded.' }, { status: 500 });
  return Response.json({
    mode: data.access_mode,
    username: data.username || '',
    hasPassword: Boolean(data.password_hash),
    updatedAt: data.updated_at,
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!(await isAdminRequest(request))) return Response.json({ error: 'Authentication required.' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { mode?: unknown; username?: unknown; password?: unknown };
  const mode = body.mode;
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (mode !== 'public' && mode !== 'password') return Response.json({ error: 'Choose Public or Private.' }, { status: 400 });
  if (mode === 'password' && !/^[A-Za-z0-9._-]{1,64}$/.test(username)) {
    return Response.json({ error: 'Use 1–64 letters, numbers, dots, dashes or underscores for the preview username.' }, { status: 400 });
  }
  if (password && password.length < 10) return Response.json({ error: 'The preview password must be at least 10 characters.' }, { status: 400 });

  const client = getAdminServerClient();
  const { data: current, error: readError } = await client.from('site_access_settings').select('password_hash').eq('id', 1).single();
  if (readError) return Response.json({ error: 'Site access settings could not be loaded.' }, { status: 500 });
  const passwordHash = password ? await hashSitePassword(password) : current.password_hash;
  if (mode === 'password' && !passwordHash) return Response.json({ error: 'Set a preview password before making the site private.' }, { status: 400 });

  const { error } = await client.from('site_access_settings').update({
    access_mode: mode,
    username: username || null,
    password_hash: passwordHash,
    updated_at: new Date().toISOString(),
  }).eq('id', 1);
  if (error) return Response.json({ error: 'Site access settings could not be saved.' }, { status: 500 });
  return Response.json({ ok: true });
}
