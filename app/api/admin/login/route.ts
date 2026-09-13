import { adminCredentialsAreValid, createAdminCookie, sameOrigin } from '@/lib/admin-auth';

const attempts = new Map<string, { count: number; resetsAt: number }>();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  const address = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const existing = attempts.get(address);
  const now = Date.now();
  const record = !existing || existing.resetsAt < now ? { count: 0, resetsAt: now + 15 * 60_000 } : existing;
  record.count += 1;
  attempts.set(address, record);
  if (record.count > 8) return Response.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });

  const body = (await request.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
  if (typeof body.email !== 'string' || typeof body.password !== 'string' || !(await adminCredentialsAreValid(body.email, body.password))) {
    return Response.json({ error: 'That email or password is not recognised.' }, { status: 401 });
  }
  attempts.delete(address);
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': await createAdminCookie(), 'Cache-Control': 'no-store' } });
}
