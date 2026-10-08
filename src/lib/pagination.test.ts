import { describe, expect, it, vi } from 'vitest';
import { fetchAllPages, MAX_PAGES, mergeRosterPages, PAGE_LIMIT } from './pagination';

describe('fetchAllPages', () => {
  it('requests the page size and stops when the total is covered', async () => {
    const load = vi.fn(async (page: number) => ({ items: [page], total: PAGE_LIMIT * 2 + 1 }));
    expect(await fetchAllPages(load)).toEqual([1, 2, 3]);
    expect(load).toHaveBeenCalledWith(1, PAGE_LIMIT);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it('stops after a single page when everything fits', async () => {
    const load = vi.fn(async () => ({ items: ['a'], total: 1 }));
    await fetchAllPages(load);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('never loops past the page cap', async () => {
    const load = vi.fn(async () => ({ items: [1], total: Number.MAX_SAFE_INTEGER }));
    await fetchAllPages(load);
    expect(load).toHaveBeenCalledTimes(MAX_PAGES);
  });
});

describe('mergeRosterPages', () => {
  const student = (id: string, offeringIds: string[]) => ({
    id,
    fullName: id,
    cedula: id,
    offeringIds,
    total: 5,
  });

  it('joins the offerings of a student split across pages', () => {
    const merged = mergeRosterPages([
      { offerings: [], students: [student('a', ['o1']), student('b', ['o1'])], generatedAt: 't1' },
      { offerings: [], students: [student('b', ['o2'])], generatedAt: 't2' },
    ]);
    expect(merged.students).toHaveLength(2);
    expect(merged.students.find((item) => item.id === 'b')?.offeringIds).toEqual(['o1', 'o2']);
    expect(merged.generatedAt).toBe('t1');
  });
});
