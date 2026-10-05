import { apiDownload, apiRequest } from './api-client';
import type { Roster } from './offline/cache';
import {
  DashboardRow,
  Invite,
  Offering,
  ScanResult,
  StudentDetail,
  StudentSummary,
  User,
  UserStatus,
} from '@/types/api';

interface SessionPayload {
  user: User;
  accessToken?: string;
}

export interface StudentRegistration {
  cedula: string;
  fullName: string;
  password: string;
  email?: string;
  offeringIds: string[];
}

export interface TeacherRegistration {
  cedula: string;
  fullName: string;
  password: string;
  email?: string;
  inviteCode?: string;
}

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

export const authService = {
  login: (cedula: string, password: string) =>
    apiRequest<SessionPayload>('/auth/login', {
      method: 'POST',
      body: { cedula, password },
      authenticated: false,
    }),
  registerStudent: (input: StudentRegistration) =>
    apiRequest<SessionPayload>('/auth/register/student', {
      method: 'POST',
      body: input,
      authenticated: false,
    }),
  registerTeacher: (input: TeacherRegistration) =>
    apiRequest<SessionPayload>('/auth/register/teacher', {
      method: 'POST',
      body: input,
      authenticated: false,
    }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST', authenticated: false }),
  me: () => apiRequest<{ user: User }>('/auth/me'),
};

export const offeringService = {
  listPublic: async (q?: string) =>
    (await apiRequest<Offering[]>('/offerings/public', { query: { q } })).payload,
  listMine: async () => (await apiRequest<Offering[]>('/offerings/mine')).payload,
  create: (body: { courseCode: string; courseName: string; term: string }) =>
    apiRequest<Offering>('/offerings', { method: 'POST', body }),
  update: (id: string, body: { courseName?: string; active?: boolean }) =>
    apiRequest<Offering>(`/offerings/${id}`, { method: 'PATCH', body }),
};

export const enrollmentService = {
  listMine: async () => (await apiRequest<Offering[]>('/enrollments/mine')).payload,
  enroll: (offeringId: string) => apiRequest<void>('/enrollments', { method: 'POST', body: { offeringId } }),
  unenroll: (offeringId: string) => apiRequest<void>(`/enrollments/${offeringId}`, { method: 'DELETE' }),
};

export const polipointService = {
  summary: async () => (await apiRequest<StudentSummary>('/polipoints/me')).payload,
  qr: async () => (await apiRequest<{ token: string }>('/polipoints/me/qr')).payload.token,
  rotateQr: async () =>
    (await apiRequest<{ token: string }>('/polipoints/me/qr/rotate', { method: 'POST' })).payload.token,
  scan: async (token: string) =>
    (await apiRequest<ScanResult>('/polipoints/scan', { method: 'POST', body: { token } })).payload,
  award: (body: {
    studentId: string;
    offeringId: string;
    points: number;
    reason?: string;
    idempotencyKey: string;
    source?: 'qr' | 'manual';
  }) => apiRequest<{ id: string }>('/polipoints/awards', { method: 'POST', body }),
  awardBatch: async (items: OfflineAwardPayload[]) =>
    (await apiRequest<BatchResult[]>('/polipoints/awards/batch', { method: 'POST', body: { items } }))
      .payload,
  roster: async () => (await apiRequest<Roster>('/polipoints/roster')).payload,
  revoke: (id: string, reason?: string) =>
    apiRequest<void>(`/polipoints/awards/${id}/revoke`, { method: 'POST', body: { reason } }),
};

export const dashboardService = {
  students: (filters: DashboardFilters) =>
    apiRequest<DashboardRow[]>('/teacher/students', { query: { ...filters } }),
  exportCsv: (filters: DashboardFilters) => apiDownload('/teacher/students/export', { ...filters }),
  detail: async (studentId: string) =>
    (await apiRequest<StudentDetail>(`/teacher/students/${studentId}`)).payload,
};

export const adminService = {
  teachers: (status?: UserStatus) => apiRequest<User[]>('/admin/teachers', { query: { status, limit: 100 } }),
  approveTeacher: (id: string) => apiRequest<User>(`/admin/teachers/${id}/approve`, { method: 'PATCH' }),
  disableTeacher: (id: string) => apiRequest<User>(`/admin/teachers/${id}/disable`, { method: 'PATCH' }),
  createInvite: async (expiresInDays: number) =>
    (await apiRequest<Invite>('/admin/invites', { method: 'POST', body: { expiresInDays } })).payload,
  createAdmin: (body: { cedula: string; fullName: string; password: string }) =>
    apiRequest<User>('/admin/admins', { method: 'POST', body }),
};
