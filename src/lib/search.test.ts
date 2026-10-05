import { describe, expect, it } from 'vitest';
import { matchesStudent, normalizeSearch } from './search';

describe('search', () => {
  it('ignores accents and case', () => {
    expect(normalizeSearch('  María José ')).toBe('maria jose');
  });

  it('matches every term against the name or the cedula', () => {
    expect(matchesStudent('maria perez', 'María José Pérez', '1234567890')).toBe(true);
    expect(matchesStudent('maria gomez', 'María José Pérez', '1234567890')).toBe(false);
    expect(matchesStudent('4567', 'María José Pérez', '1234567890')).toBe(true);
    expect(matchesStudent('1.234.567', 'María José Pérez', '1234567890')).toBe(true);
    expect(matchesStudent('', 'María José Pérez', '1234567890')).toBe(true);
  });
});
