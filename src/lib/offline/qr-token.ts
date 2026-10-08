import type { QrClaims } from '@/types/security';
export function readQrSubject(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))) as QrClaims;
    return claims.typ === 'qr' && typeof claims.sub === 'string' ? claims.sub : null;
  } catch {
    return null;
  }
}
