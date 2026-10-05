import { describe, expect, it } from 'vitest';
import { readQrSubject } from './qr-token';

const encode = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const tokenWith = (claims: object) => `${encode({ alg: 'HS256' })}.${encode(claims)}.signature`;

describe('readQrSubject', () => {
  it('reads the student id from a qr token', () => {
    expect(readQrSubject(tokenWith({ sub: 'student-1', typ: 'qr', v: 0 }))).toBe('student-1');
  });

  it('rejects tokens that are not qr tokens', () => {
    expect(readQrSubject(tokenWith({ sub: 'student-1', typ: 'access' }))).toBeNull();
    expect(readQrSubject('not-a-token')).toBeNull();
    expect(readQrSubject('a.%%%.c')).toBeNull();
  });
});
