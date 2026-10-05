import { Role } from '@/types/api';

export const SESSION_COOKIE = 'apex_session';

const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const roles: Role[] = ['student', 'teacher', 'admin', 'super_admin'];

export const parseSessionRole = (value: string | undefined): Role | null =>
  roles.find((role) => role === value) ?? null;

export const sessionCookie = {
  set: (role: Role) => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${SESSION_COOKIE}=${role}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  },
  clear: () => {
    document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  },
};
