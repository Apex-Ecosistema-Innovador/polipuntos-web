import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkError } from '@/lib/api-client';
import { polipointService } from '@/lib/services';
import { awardQueue } from './award-queue';

vi.mock('@/lib/services', () => ({ polipointService: { awardBatch: vi.fn() } }));

const awardBatch = vi.mocked(polipointService.awardBatch);

const base = {
  teacherId: 'teacher-1',
  qrToken: 'token',
  studentId: 'student-1',
  studentName: 'Estudiante Uno',
  offeringId: 'offering-1',
  offeringLabel: '001 · Algoritmos I',
  points: 10,
};

async function clear() {
  const items = [...(await awardQueue.list('teacher-1')), ...(await awardQueue.list('teacher-2'))];
  await Promise.all(items.map((item) => awardQueue.discard(item.id)));
}

describe('award queue', () => {
  beforeEach(async () => {
    awardBatch.mockReset();
    await clear();
  });

  it('keeps items ordered by capture time and scoped to the teacher', async () => {
    await awardQueue.enqueue({ ...base, id: 'b', occurredAt: '2026-10-05T10:00:00.000Z' });
    await awardQueue.enqueue({ ...base, id: 'a', occurredAt: '2026-10-05T09:00:00.000Z' });
    await awardQueue.enqueue({ ...base, id: 'c', teacherId: 'teacher-2' });

    expect((await awardQueue.list('teacher-1')).map((item) => item.id)).toEqual(['a', 'b']);
    expect(await awardQueue.list('teacher-2')).toHaveLength(1);
  });

  it('removes synced and duplicate items and keeps rejected ones with their reason', async () => {
    await awardQueue.enqueue({ ...base, id: 'created', occurredAt: '2026-10-05T09:00:00.000Z' });
    await awardQueue.enqueue({ ...base, id: 'duplicate', occurredAt: '2026-10-05T09:01:00.000Z' });
    await awardQueue.enqueue({ ...base, id: 'rejected', occurredAt: '2026-10-05T09:02:00.000Z' });
    awardBatch.mockResolvedValue([
      { idempotencyKey: 'created', status: 'created' },
      { idempotencyKey: 'duplicate', status: 'duplicate' },
      { idempotencyKey: 'rejected', status: 'rejected', error: 'El código QR no es válido' },
    ]);

    expect(await awardQueue.sync('teacher-1')).toEqual({ synced: 2, rejected: 1 });

    const remaining = await awardQueue.list('teacher-1');
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toMatchObject({
      id: 'rejected',
      status: 'rejected',
      error: 'El código QR no es válido',
    });
    expect(awardBatch.mock.calls[0][0].map((item) => item.idempotencyKey)).toEqual([
      'created',
      'duplicate',
      'rejected',
    ]);
  });

  it('leaves everything pending when the network fails', async () => {
    await awardQueue.enqueue({ ...base, id: 'offline' });
    awardBatch.mockRejectedValue(new NetworkError());

    await expect(awardQueue.sync('teacher-1')).rejects.toBeInstanceOf(NetworkError);
    expect((await awardQueue.list('teacher-1'))[0]).toMatchObject({ id: 'offline', status: 'pending' });
  });

  it('does not resend rejected items until they are retried', async () => {
    await awardQueue.enqueue({ ...base, id: 'bad' });
    awardBatch.mockResolvedValueOnce([{ idempotencyKey: 'bad', status: 'rejected', error: 'x' }]);
    await awardQueue.sync('teacher-1');

    awardBatch.mockClear();
    await awardQueue.sync('teacher-1');
    expect(awardBatch).not.toHaveBeenCalled();

    await awardQueue.retry('bad');
    awardBatch.mockResolvedValueOnce([{ idempotencyKey: 'bad', status: 'created' }]);
    await awardQueue.sync('teacher-1');
    expect(await awardQueue.list('teacher-1')).toHaveLength(0);
  });

  it('shares a single flush between concurrent syncs', async () => {
    await awardQueue.enqueue({ ...base, id: 'once' });
    awardBatch.mockResolvedValue([{ idempotencyKey: 'once', status: 'created' }]);

    await Promise.all([awardQueue.sync('teacher-1'), awardQueue.sync('teacher-1')]);
    expect(awardBatch).toHaveBeenCalledTimes(1);
  });
});
