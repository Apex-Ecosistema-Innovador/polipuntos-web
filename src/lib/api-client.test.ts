import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, refreshSession, tokenStore } from './api-client';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  tokenStore.set('access-1');
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  tokenStore.set(null);
});

describe('session revocation', () => {
  it('drops the access token immediately', () => {
    tokenStore.revoke();
    expect(tokenStore.get()).toBeNull();
  });

  it('does not silently renew the session after signing out', async () => {
    tokenStore.revoke();
    fetchMock.mockResolvedValue(json(401, { message: 'Sesión no válida' }));

    await expect(apiRequest('/auth/me')).rejects.toMatchObject({ status: 401 });

    const urls = fetchMock.mock.calls.map(([input]) => String(input));
    expect(urls.some((url) => url.endsWith('/auth/refresh'))).toBe(false);
    expect(await refreshSession()).toBeNull();
  });

  it('ignores a refresh that resolves after signing out', async () => {
    let finish!: (response: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (finish = resolve)));

    const pending = refreshSession();
    tokenStore.revoke();
    finish(json(200, { payload: { accessToken: 'late-token' } }));

    expect(await pending).toBeNull();
    expect(tokenStore.get()).toBeNull();
  });

  it('allows a new session after signing in again', async () => {
    tokenStore.revoke();
    tokenStore.set('access-2');
    fetchMock.mockResolvedValue(json(200, { payload: { ok: true } }));

    await apiRequest('/auth/me');

    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Authorization')).toBe('Bearer access-2');
  });
});
