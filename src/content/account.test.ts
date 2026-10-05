import { describe, expect, it } from 'vitest';
import { institutionalEmailError } from './account';

describe('institutionalEmailError', () => {
  it('accepts institutional addresses regardless of case and spacing', () => {
    expect(institutionalEmailError('ana.gomez@elpoli.edu.co')).toBeUndefined();
    expect(institutionalEmailError('  Ana.Gomez@ELPOLI.edu.co ')).toBeUndefined();
  });

  it('rejects empty, malformed and external addresses', () => {
    expect(institutionalEmailError('')).toBeDefined();
    expect(institutionalEmailError('ana')).toBeDefined();
    expect(institutionalEmailError('a@b@elpoli.edu.co')).toBeDefined();
    expect(institutionalEmailError('ana@gmail.com')).toContain('@elpoli.edu.co');
    expect(institutionalEmailError('ana@elpoli.edu.co.evil.com')).toContain('@elpoli.edu.co');
    expect(institutionalEmailError('ana@fake-elpoli.edu.co')).toContain('@elpoli.edu.co');
  });
});
