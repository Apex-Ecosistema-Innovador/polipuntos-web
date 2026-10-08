import type { Roster } from '@/types/offline';

export const PAGE_LIMIT = 100;
export const MAX_PAGES = 50;
export const HISTORY_PAGE_SIZE = 10;
export const EXPORT_LIMIT = 5000;

export async function fetchAllPages<T>(
  load: (page: number, limit: number) => Promise<{ items: T[]; total: number }>,
): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await load(page, PAGE_LIMIT);
    items.push(...result.items);
    if (page * PAGE_LIMIT >= result.total) break;
  }
  return items;
}

export function mergeRosterPages(pages: Roster[]): Roster {
  const students = new Map<string, Roster['students'][number]>();
  pages.forEach((page) =>
    page.students.forEach((student) => {
      const known = students.get(student.id);
      students.set(
        student.id,
        known
          ? { ...known, offeringIds: [...new Set([...known.offeringIds, ...student.offeringIds])] }
          : student,
      );
    }),
  );
  const first = pages[0];
  return { offerings: first.offerings, students: [...students.values()], generatedAt: first.generatedAt };
}
