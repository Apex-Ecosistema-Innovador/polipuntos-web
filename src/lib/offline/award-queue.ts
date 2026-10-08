import { run, stores } from './db';
import { polipointService } from '@/lib/services';
import type { NewQueuedAward, QueuedAward, SyncOutcome } from '@/types/offline';

const BATCH_SIZE = 50;

let running: Promise<SyncOutcome> | null = null;

const listAll = async () => (await run(stores.queue, 'readonly', (store) => store.getAll())) as QueuedAward[];

const put = (item: QueuedAward) => run(stores.queue, 'readwrite', (store) => store.put(item));

const drop = (id: string) => run(stores.queue, 'readwrite', (store) => store.delete(id));

const byDate = (left: QueuedAward, right: QueuedAward) => left.occurredAt.localeCompare(right.occurredAt);

export const awardQueue = {
  list: async (teacherId: string) =>
    (await listAll()).filter((item) => item.teacherId === teacherId).sort(byDate),

  enqueue: async (input: NewQueuedAward) => {
    const item: QueuedAward = {
      ...input,
      id: input.id ?? crypto.randomUUID(),
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      status: 'pending',
    };
    await put(item);
    return item;
  },

  discard: (id: string) => drop(id),

  retry: async (id: string) => {
    const item = (await listAll()).find((entry) => entry.id === id);
    if (item) await put({ ...item, status: 'pending', error: undefined });
  },

  sync: (teacherId: string): Promise<SyncOutcome> => {
    if (!running) {
      running = flush(teacherId).finally(() => {
        running = null;
      });
    }
    return running;
  },
};

async function flush(teacherId: string): Promise<SyncOutcome> {
  const pending = (await awardQueue.list(teacherId)).filter((item) => item.status === 'pending');
  const outcome: SyncOutcome = { synced: 0, rejected: 0 };

  for (let start = 0; start < pending.length; start += BATCH_SIZE) {
    const chunk = pending.slice(start, start + BATCH_SIZE);
    const results = await polipointService.awardBatch(
      chunk.map((item) => ({
        qrToken: item.qrToken,
        studentId: item.qrToken ? undefined : item.studentId,
        offeringId: item.offeringId,
        points: item.points,
        reason: item.reason,
        idempotencyKey: item.id,
        occurredAt: item.occurredAt,
      })),
    );

    await Promise.all(
      chunk.map(async (item, index) => {
        const result = results[index];
        if (result?.status === 'rejected') {
          outcome.rejected += 1;
          await put({ ...item, status: 'rejected', error: result.error });
          return;
        }
        outcome.synced += 1;
        await drop(item.id);
      }),
    );
  }

  return outcome;
}
