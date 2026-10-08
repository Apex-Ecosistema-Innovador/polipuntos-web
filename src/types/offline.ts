import type { Offering, StudentSummary } from './api';

export interface Stamped<T> {
  value: T;
  savedAt: string;
}

export interface RosterStudent {
  id: string;
  fullName: string;
  cedula: string;
  offeringIds: string[];
  total: number;
}

export interface Roster {
  offerings: Offering[];
  students: RosterStudent[];
  generatedAt: string;
}

export type QueuedStatus = 'pending' | 'rejected';

export interface QueuedAward {
  id: string;
  teacherId: string;
  qrToken?: string;
  studentId: string;
  studentName: string | null;
  offeringId: string;
  offeringLabel: string;
  points: number;
  reason?: string;
  occurredAt: string;
  status: QueuedStatus;
  error?: string;
}

export type NewQueuedAward = Omit<QueuedAward, 'status' | 'error' | 'occurredAt' | 'id'> &
  Partial<Pick<QueuedAward, 'id' | 'occurredAt'>>;

export interface SyncOutcome {
  synced: number;
  rejected: number;
}

export interface SyncValue {
  items: QueuedAward[];
  pending: number;
  rejected: number;
  syncing: boolean;
  lastOutcome: SyncOutcome | null;
  lastError: string | null;
  roster: Roster | null;
  enqueue: (input: Omit<NewQueuedAward, 'teacherId'>) => Promise<QueuedAward>;
  sync: () => Promise<void>;
  discard: (id: string) => Promise<void>;
  retry: (id: string) => Promise<void>;
}

export interface ConnectivityValue {
  online: boolean;
  known: boolean;
  checking: boolean;
  recheck: () => Promise<boolean>;
}

export interface QrState {
  image: string;
  fromDevice: boolean;
  savedAt: string | null;
}

export interface SummaryState {
  summary: StudentSummary;
  savedAt: string | null;
}

export type AwardMode = 'scan' | 'manual';

export interface ScannedStudent {
  token: string | null;
  id: string;
  fullName: string | null;
  cedula: string | null;
  offerings: Offering[];
  total: number | null;
  totalIsLive: boolean;
  verified: boolean;
}
