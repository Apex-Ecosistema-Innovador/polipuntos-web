import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy } from './content-security-policy';

const directive = (policy: string, name: string) =>
  policy
    .split('; ')
    .find((entry) => entry.startsWith(`${name} `))
    ?.slice(name.length + 1)
    .split(' ') ?? [];

describe('buildContentSecurityPolicy', () => {
  const policy = buildContentSecurityPolicy({ nonce: 'abc123', apiOrigin: 'https://api.example.com' });

  it('allows scripts only through the nonce', () => {
    const scripts = directive(policy, 'script-src');
    expect(scripts).toContain("'nonce-abc123'");
    expect(scripts).toContain("'strict-dynamic'");
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(scripts).not.toContain("'unsafe-eval'");
  });

  it('limits network access to the app and the api origin', () => {
    expect(directive(policy, 'connect-src')).toEqual(["'self'", 'https://api.example.com']);
  });

  it('blocks plugins, framing and base tag hijacking', () => {
    expect(directive(policy, 'object-src')).toEqual(["'none'"]);
    expect(directive(policy, 'frame-ancestors')).toEqual(["'none'"]);
    expect(directive(policy, 'base-uri')).toEqual(["'self'"]);
    expect(directive(policy, 'form-action')).toEqual(["'self'"]);
  });

  it('keeps inline styles restricted to attributes', () => {
    expect(directive(policy, 'style-src')).not.toContain("'unsafe-inline'");
    expect(directive(policy, 'style-src-attr')).toEqual(["'unsafe-inline'"]);
  });

  it('upgrades insecure requests in production only', () => {
    expect(policy).toContain('upgrade-insecure-requests');
    const development = buildContentSecurityPolicy({
      nonce: 'n',
      apiOrigin: 'http://localhost:5000',
      development: true,
    });
    expect(development).not.toContain('upgrade-insecure-requests');
    expect(directive(development, 'script-src')).toContain("'unsafe-eval'");
  });
});
