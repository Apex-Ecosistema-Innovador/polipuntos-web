export type Role = 'student' | 'teacher' | 'admin' | 'super_admin';

export type UserStatus = 'active' | 'pending_approval' | 'disabled';

export interface User {
  id: string;
  cedula: string;
  fullName: string;
  email: string | null;
  role: Role;
  status: UserStatus;
}

export interface Offering {
  id: string;
  courseCode: string;
  courseName: string;
  term: string;
  active: boolean;
  teacher: { id: string; fullName: string };
}

export interface OfferingTotal {
  offeringId: string;
  courseCode: string;
  courseName: string;
  term: string;
  teacherName: string;
  points: number;
}

export interface AwardHistoryItem {
  id: string;
  points: number;
  reason: string | null;
  createdAt: string;
  revokedAt: string | null;
  courseCode: string;
  courseName: string;
  term: string;
  teacherName: string;
}

export interface StudentSummary {
  total: number;
  offerings: OfferingTotal[];
  history: AwardHistoryItem[];
}

export interface ScanResult {
  student: User;
  offerings: Offering[];
  total: number;
}

export interface DashboardRow {
  studentId: string;
  fullName: string;
  cedula: string;
  offeringId: string;
  courseCode: string;
  courseName: string;
  term: string;
  points: number;
}

export interface StudentDetail {
  student: User;
  offerings: OfferingTotal[];
  history: AwardHistoryItem[];
}

export interface Invite {
  code: string;
  expiresAt: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
