import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from './proxy';

const request = (path: string, role?: string) =>
  new NextRequest(`http://localhost:3000${path}`, {
    headers: role ? { cookie: `apex_session=${role}` } : {},
  });

const location = (response: Response) => {
  const header = response.headers.get('location');
  return header ? new URL(header).pathname + new URL(header).search : null;
};

describe('proxy', () => {
  it('sends anonymous visitors of protected areas to login with the destination', () => {
    expect(location(proxy(request('/profesor/escanear')))).toBe('/login?next=%2Fprofesor%2Fescanear');
  });

  it('keeps users inside their own area', () => {
    expect(location(proxy(request('/profesor', 'student')))).toBe('/estudiante');
    expect(location(proxy(request('/admin', 'teacher')))).toBe('/profesor');
    expect(proxy(request('/estudiante/qr', 'student')).headers.get('location')).toBeNull();
  });

  it('requires a session for the account page but accepts every role', () => {
    expect(location(proxy(request('/cuenta')))).toBe('/login?next=%2Fcuenta');
    for (const role of ['student', 'teacher', 'admin', 'super_admin']) {
      expect(proxy(request('/cuenta', role)).headers.get('location')).toBeNull();
    }
  });

  it('keeps recovery pages reachable with or without a session', () => {
    expect(proxy(request('/recuperar-contrasena')).headers.get('location')).toBeNull();
    expect(proxy(request('/restablecer-contrasena', 'student')).headers.get('location')).toBeNull();
  });

  it('lets both admin roles into the admin area', () => {
    expect(proxy(request('/admin', 'super_admin')).headers.get('location')).toBeNull();
    expect(proxy(request('/admin', 'admin')).headers.get('location')).toBeNull();
  });

  it('moves signed in users away from guest pages', () => {
    expect(location(proxy(request('/login', 'teacher')))).toBe('/profesor');
    expect(proxy(request('/login')).headers.get('location')).toBeNull();
  });

  it('resolves aliases by role', () => {
    expect(location(proxy(request('/dashboard', 'student')))).toBe('/estudiante');
    expect(location(proxy(request('/scan', 'teacher')))).toBe('/profesor/escanear');
    expect(location(proxy(request('/dashboard')))).toBe('/login?next=%2Fdashboard');
    expect(location(proxy(request('/signin')))).toBe('/login');
  });

  it('ignores a forged session cookie value', () => {
    expect(location(proxy(request('/estudiante', 'root')))).toBe('/login?next=%2Festudiante');
  });
});
