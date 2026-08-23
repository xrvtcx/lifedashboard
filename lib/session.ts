// Shared helper for the single-shared-password auth gate.
// Uses the Web Crypto API (available in both the Edge middleware runtime
// and Node's server action runtime) so the same code works in both places.

export const SESSION_COOKIE = 'session';

export async function computeSessionToken(secret: string, password: string) {
  const raw = `${secret}:${password}`;
  const data = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
