import { afterEach, describe, expect, it, vi } from 'vitest';
import { recentAwards } from './recent-awards';

describe('recentAwards', () => {
  afterEach(() => vi.useRealTimers());

  it('flags the same student and offering for 30 seconds', () => {
    vi.useFakeTimers();
    recentAwards.record('s1', 'o1');

    expect(recentAwards.isRecent('s1', 'o1')).toBe(true);
    expect(recentAwards.isRecent('s1', 'o2')).toBe(false);

    vi.advanceTimersByTime(31000);
    expect(recentAwards.isRecent('s1', 'o1')).toBe(false);
  });
});
