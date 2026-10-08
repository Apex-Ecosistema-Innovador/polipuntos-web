export interface DashboardFilters {
  offeringId?: string;
  q?: string;
  minPoints?: number;
  maxPoints?: number;
  sort?: 'name' | 'cedula' | 'points';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OfflineAwardPayload {
  qrToken?: string;
  studentId?: string;
  offeringId: string;
  points: number;
  reason?: string;
  idempotencyKey: string;
  occurredAt: string;
}

export interface BatchResult {
  idempotencyKey: string;
  status: 'created' | 'duplicate' | 'rejected';
  error?: string;
}

export interface Envelope<T> {
  message?: string;
  payload: T;
  page?: number;
  limit?: number;
  total?: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  authenticated?: boolean;
}

export type NetworkListener = (reachable: boolean) => void;
