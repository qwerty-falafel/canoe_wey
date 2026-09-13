import { getAdminServerClient } from '@/lib/supabase';

const HASH_ALGORITHM = 'PBKDF2-SHA256';
const HASH_ITERATIONS = 210_000;

export type SiteAccessSettings = {
  access_mode: 'public' | 'password';
  username: string | null;
  password_hash: string | null;
};

function toBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function hashSitePassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await derivePassword(password, salt, HASH_ITERATIONS);
  return `${HASH_ALGORITHM}$${HASH_ITERATIONS}$${toBase64(salt)}$${toBase64(derived)}`;
}

export async function verifySitePassword(password: string, storedHash: string) {
  const [algorithm, iterationsValue, saltValue, hashValue] = storedHash.split('$');
  const iterations = Number(iterationsValue);
  if (algorithm !== HASH_ALGORITHM || !Number.isSafeInteger(iterations) || iterations < 100_000 || !saltValue || !hashValue) return false;
  try {
    const expected = fromBase64(hashValue);
    const actual = await derivePassword(password, fromBase64(saltValue), iterations);
    if (actual.length !== expected.length) return false;
    let difference = 0;
    for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
    return difference === 0;
  } catch {
    return false;
  }
}

export async function readSiteAccessSettings(): Promise<SiteAccessSettings> {
  const { data, error } = await getAdminServerClient()
    .from('site_access_settings')
    .select('access_mode,username,password_hash')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data as SiteAccessSettings;
}
