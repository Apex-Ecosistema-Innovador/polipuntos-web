import { describe, expect, it } from 'vitest';
import {
  cedulaError,
  courseCodeError,
  firstError,
  nameError,
  passwordError,
  sanitizeCedula,
  sanitizeCourseCode,
  sanitizeName,
  sanitizeTerm,
  termError,
} from './validation';

describe('sanitizers', () => {
  it('uppercases course codes and drops everything but letters and digits', () => {
    expect(sanitizeCourseCode('ing-001 x')).toBe('ING001X');
  });

  it('keeps only digits in cedulas', () => {
    expect(sanitizeCedula('1.234.567-8')).toBe('12345678');
  });

  it('formats terms as year-semester while typing', () => {
    expect(sanitizeTerm('2026')).toBe('2026');
    expect(sanitizeTerm('20262')).toBe('2026-2');
    expect(sanitizeTerm('2026-2-9')).toBe('2026-2');
  });

  it('removes digits and symbols from names', () => {
    expect(sanitizeName('  Ana2  María!')).toBe('Ana María');
  });
});

describe('validators', () => {
  it('accepts valid terms only', () => {
    expect(termError('2026-2')).toBeUndefined();
    expect(termError('2027-1')).toBeUndefined();
    expect(termError('2026-3')).toBeDefined();
    expect(termError('2026')).toBeDefined();
  });

  it('rejects lowercase and dashed course codes', () => {
    expect(courseCodeError('ING001')).toBeUndefined();
    expect(courseCodeError('ing001')).toBeDefined();
    expect(courseCodeError('ING-001')).toBeDefined();
  });

  it('checks cedula length', () => {
    expect(cedulaError('1234')).toBeDefined();
    expect(cedulaError('1234567890')).toBeUndefined();
  });

  it('checks names and passwords', () => {
    expect(nameError('Ana Gómez')).toBeUndefined();
    expect(nameError('A')).toBeDefined();
    expect(passwordError('1234567')).toBeDefined();
    expect(passwordError('12345678')).toBeUndefined();
  });

  it('keeps only present errors', () => {
    expect(firstError({ a: undefined, b: 'mal' })).toEqual({ b: 'mal' });
  });
});
