import { describe, expect, it } from 'vitest';
import { resolveApiUrl } from './env';

const configured = 'http://localhost:4000/api/v1';

describe('resolveApiUrl', () => {
  it('keeps the configured url when the page is served from localhost', () => {
    expect(resolveApiUrl('localhost', { configured, local: true })).toBe(configured);
    expect(resolveApiUrl('127.0.0.1', { configured, local: true })).toBe(configured);
  });

  it('follows the page host in local mode so other devices reach the api on the same machine', () => {
    expect(resolveApiUrl('192.168.10.14', { configured, local: true })).toBe(
      'http://192.168.10.14:4000/api/v1',
    );
    expect(resolveApiUrl('mac.local', { configured, local: true })).toBe('http://mac.local:4000/api/v1');
  });

  it('never rewrites the url in production', () => {
    expect(resolveApiUrl('192.168.10.14', { configured, local: false })).toBe(configured);
  });

  it('keeps an explicit non loopback api url', () => {
    const remote = 'https://api.example.com/api/v1';
    expect(resolveApiUrl('192.168.10.14', { configured: remote, local: true })).toBe(remote);
  });
});
