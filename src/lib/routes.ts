import { Role } from '@/types/api';

export const homeFor = (role: Role) => {
  if (role === 'student') return '/estudiante';
  if (role === 'teacher') return '/profesor';
  return '/admin';
};
