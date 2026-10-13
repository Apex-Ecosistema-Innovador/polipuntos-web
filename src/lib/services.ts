import { apiDownload, apiRequest } from './api-client';
import { EXPORT_LIMIT, fetchAllPages, HISTORY_PAGE_SIZE, mergeRosterPages } from './pagination';
import {
  DashboardRow,
  Invite,
  Offering,
  RankingPage,
  ScheduleOverview,
  ScanResult,
  StudentDetail,
  StudentSummary,
  User,
  UserStatus,
} from '@/types/api';
import type { SessionPayload, StudentRegistration, TeacherRegistration } from '@/types/auth';
import type { Roster } from '@/types/offline';
import type { BatchResult, DashboardFilters, OfflineAwardPayload } from '@/types/requests';

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
  forgotPassword: (email: string) =>
    apiRequest<void>('/auth/forgot-password', { method: 'POST', body: { email }, authenticated: false }),
  resetPassword: (token: string, password: string) =>
    apiRequest<void>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      authenticated: false,
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<SessionPayload>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST', authenticated: false }),
  me: () => apiRequest<{ user: User }>('/auth/me'),
};

export const offeringService = {
  listPublic: (q?: string) =>
    fetchAllPages(async (page, limit) => {
      const response = await apiRequest<Offering[]>('/offerings/public', { query: { q, page, limit } });
      return { items: response.payload, total: response.total ?? 0 };
    }),
  listMine: () =>
    fetchAllPages(async (page, limit) => {
      const response = await apiRequest<Offering[]>('/offerings/mine', { query: { page, limit } });
      return { items: response.payload, total: response.total ?? 0 };
    }),
  create: (body: { courseCode: string; courseName: string; term: string }) =>
    apiRequest<Offering>('/offerings', { method: 'POST', body }),
  update: (id: string, body: { courseName?: string; active?: boolean }) =>
    apiRequest<Offering>(`/offerings/${id}`, { method: 'PATCH', body }),
};

export const enrollmentService = {
  listMine: () =>
    fetchAllPages(async (page, limit) => {
      const response = await apiRequest<Offering[]>('/enrollments/mine', { query: { page, limit } });
      return { items: response.payload, total: response.total ?? 0 };
    }),
  enroll: (offeringId: string) => apiRequest<void>('/enrollments', { method: 'POST', body: { offeringId } }),
  unenroll: (offeringId: string) => apiRequest<void>(`/enrollments/${offeringId}`, { method: 'DELETE' }),
};

export const polipointService = {
  summary: async (page = 1) =>
    (await apiRequest<StudentSummary>('/polipoints/me', { query: { page, limit: HISTORY_PAGE_SIZE } }))
      .payload,
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
  roster: async () => {
    const pages: Roster[] = [];
    await fetchAllPages(async (page, limit) => {
      const response = await apiRequest<Roster>('/polipoints/roster', { query: { page, limit } });
      pages.push(response.payload);
      return { items: response.payload.students, total: response.total ?? 0 };
    });
    return mergeRosterPages(pages);
  },
  revoke: (id: string, reason?: string) =>
    apiRequest<void>(`/polipoints/awards/${id}/revoke`, { method: 'POST', body: { reason } }),
};

export const dashboardService = {
  students: (filters: DashboardFilters) =>
    apiRequest<DashboardRow[]>('/teacher/students', { query: { ...filters } }),
  exportCsv: (filters: DashboardFilters) =>
    apiDownload('/teacher/students/export', { ...filters, page: undefined, limit: EXPORT_LIMIT }),
  detail: async (studentId: string, page = 1) =>
    (
      await apiRequest<StudentDetail>(`/teacher/students/${studentId}`, {
        query: { page, limit: HISTORY_PAGE_SIZE },
      })
    ).payload,
};

export const adminService = {
  teachers: (status?: UserStatus) =>
    fetchAllPages(async (page, limit) => {
      const response = await apiRequest<User[]>('/admin/teachers', { query: { status, page, limit } });
      return { items: response.payload, total: response.total ?? 0 };
    }),
  approveTeacher: (id: string) => apiRequest<User>(`/admin/teachers/${id}/approve`, { method: 'PATCH' }),
  disableTeacher: (id: string) => apiRequest<User>(`/admin/teachers/${id}/disable`, { method: 'PATCH' }),
  createInvite: async (expiresInDays: number) =>
    (await apiRequest<Invite>('/admin/invites', { method: 'POST', body: { expiresInDays } })).payload,
  createAdmin: (body: { cedula: string; fullName: string; email: string; password: string }) =>
    apiRequest<User>('/admin/admins', { method: 'POST', body }),
};

export const scheduleService = {
  current: async () => (await apiRequest<ScheduleOverview>('/schedule/current')).payload,
  upload: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return (await apiRequest<ScheduleOverview>('/schedule', { method: 'POST', form })).payload;
  },
  sync: async () => (await apiRequest<ScheduleOverview>('/schedule/sync', { method: 'POST' })).payload,
};

export const rankingService = {
  page: async (offeringId: string, page: number, limit: number) => {
    const response = await apiRequest<RankingPage>(`/offerings/${offeringId}/ranking`, {
      query: { page, limit },
    });
    return { ...response.payload, total: response.total ?? 0 };
  },
};
