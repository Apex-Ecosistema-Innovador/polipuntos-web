import { run, stores } from './db';
import { StudentSummary, User } from '@/types/api';
import type { Roster, Stamped } from '@/types/offline';

const keys = {
  session: 'session',
  qr: (userId: string) => `qr:${userId}`,
  summary: (userId: string) => `summary:${userId}`,
  roster: (userId: string) => `roster:${userId}`,
};

const read = async <T>(key: string): Promise<Stamped<T> | null> => {
  try {
    return ((await run(stores.kv, 'readonly', (store) => store.get(key))) as Stamped<T> | undefined) ?? null;
  } catch {
    return null;
  }
};

const write = async <T>(key: string, value: T) => {
  try {
    await run(stores.kv, 'readwrite', (store) =>
      store.put({ value, savedAt: new Date().toISOString() } satisfies Stamped<T>, key),
    );
  } catch {
    return;
  }
};

const remove = async (key: string) => {
  try {
    await run(stores.kv, 'readwrite', (store) => store.delete(key));
  } catch {
    return;
  }
};

export const offlineCache = {
  session: {
    get: () => read<User>(keys.session),
    set: (user: User) => write(keys.session, user),
    clear: () => remove(keys.session),
  },
  qr: {
    get: (userId: string) => read<string>(keys.qr(userId)),
    set: (userId: string, token: string) => write(keys.qr(userId), token),
  },
  summary: {
    get: (userId: string) => read<StudentSummary>(keys.summary(userId)),
    set: (userId: string, summary: StudentSummary) => write(keys.summary(userId), summary),
  },
  roster: {
    get: (userId: string) => read<Roster>(keys.roster(userId)),
    set: (userId: string, roster: Roster) => write(keys.roster(userId), roster),
  },
  clearUserData: async (userId: string) => {
    await Promise.all([
      remove(keys.session),
      remove(keys.qr(userId)),
      remove(keys.summary(userId)),
      remove(keys.roster(userId)),
    ]);
  },
};
