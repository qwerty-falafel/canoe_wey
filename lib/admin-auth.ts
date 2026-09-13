const COOKIE_NAME = 'canoe_admin';
const SESSION_LENGTH_SECONDS = 60 * 60 * 12;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(value: string) {
  const secret = process.env.SECRET_KEY;
  if (!secret) throw new Error('Admin session secret is not configured.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function passwordIsValid(candidate: string) {
  const password = process.env.PASSWORD;
  return Boolean(password && candidate && safeEqual(candidate, password));
}

export async function createAdminCookie() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_LENGTH_SECONDS;
  const payload = `admin.${expires}`;
  const token = `${payload}.${await sign(payload)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${SESSION_LENGTH_SECONDS}`;
}

export function clearAdminCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}

export async function isAdminRequest(request: Request) {
  const cookies = request.headers.get('cookie') || '';
  const token = cookies.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return false;
  const expires = Number(parts[1]);
  if (!Number.isSafeInteger(expires) || expires < Date.now() / 1000) return false;
  return safeEqual(parts[2], await sign(`${parts[0]}.${parts[1]}`));
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const url = new URL(origin);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    return Boolean(host && url.host === host);
  } catch {
    return false;
  }
}
