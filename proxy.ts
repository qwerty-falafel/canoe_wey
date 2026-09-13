import { NextResponse, type NextRequest } from 'next/server';
import { readSiteAccessSettings, verifySitePassword, type SiteAccessSettings } from '@/lib/site-access';

const CACHE_DURATION_MS = 2_000;
let cachedSettings: { value: SiteAccessSettings; expiresAt: number } | null = null;
const credentialCache = new Map<string, { valid: Promise<boolean>; expiresAt: number }>();

async function getSettings() {
  if (cachedSettings && cachedSettings.expiresAt > Date.now()) return cachedSettings.value;
  const value = await readSiteAccessSettings();
  cachedSettings = { value, expiresAt: Date.now() + CACHE_DURATION_MS };
  return value;
}

function requestCredentials(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Basic ')) return null;
  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(':');
    if (separator < 0) return null;
    return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
  } catch {
    return null;
  }
}

async function credentialFingerprint(username: string, password: string, passwordHash: string) {
  const input = new TextEncoder().encode(`${username}\0${password}\0${passwordHash}`);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', input));
  let binary = '';
  digest.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

async function credentialsAreValid(username: string, password: string, settings: SiteAccessSettings) {
  if (username !== settings.username || !settings.password_hash) return false;
  const fingerprint = await credentialFingerprint(username, password, settings.password_hash);
  const cached = credentialCache.get(fingerprint);
  if (cached && cached.expiresAt > Date.now()) return cached.valid;
  const valid = verifySitePassword(password, settings.password_hash);
  credentialCache.set(fingerprint, { valid, expiresAt: Date.now() + 5 * 60_000 });
  if (credentialCache.size > 32) credentialCache.delete(credentialCache.keys().next().value as string);
  return valid;
}

function lockedResponse() {
  return new NextResponse('River Wey Canoe is in private preview.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="River Wey Canoe private preview", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith('/admin') || path.startsWith('/api/admin') || path.startsWith('/_next') || path.startsWith('/media') || path === '/favicon.svg') {
    return NextResponse.next();
  }
  try {
    const settings = await getSettings();
    if (settings.access_mode === 'public') return NextResponse.next();
    const credentials = requestCredentials(request);
    if (credentials && await credentialsAreValid(credentials.username, credentials.password, settings)) return NextResponse.next();
    return lockedResponse();
  } catch {
    return NextResponse.next();
  }
}

export const config = { matcher: '/:path*' };
