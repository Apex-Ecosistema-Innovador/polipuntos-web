import { Role } from '@/types/api';

export const homeFor = (role: Role) => {
  if (role === 'student') return '/estudiante';
  if (role === 'teacher') return '/profesor';
  return '/admin';
};

export const safeNext = (next: string | null, role: Role) => {
  const home = homeFor(role);
  if (!next || !next.startsWith('/') || next.startsWith('//')) return home;
  return next === home || next.startsWith(`${home}/`) ? next : home;
};
