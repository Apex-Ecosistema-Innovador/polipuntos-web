const WINDOW_MS = 30000;

const recent = new Map<string, number>();

const keyOf = (studentId: string, offeringId: string) => `${studentId}:${offeringId}`;

export const recentAwards = {
  record: (studentId: string, offeringId: string) => recent.set(keyOf(studentId, offeringId), Date.now()),
  isRecent: (studentId: string, offeringId: string) => {
    const at = recent.get(keyOf(studentId, offeringId));
    return at !== undefined && Date.now() - at < WINDOW_MS;
  },
};
