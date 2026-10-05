import { Role } from '@/types/api';

export interface NavItem {
  href: string;
  label: string;
}

export const navigationByRole: Record<Role, NavItem[]> = {
  student: [
    { href: '/estudiante', label: 'Mis polipuntos' },
    { href: '/estudiante/qr', label: 'Mi QR' },
    { href: '/estudiante/asignaturas', label: 'Asignaturas' },
  ],
  teacher: [
    { href: '/profesor', label: 'Estudiantes' },
    { href: '/profesor/escanear', label: 'Escanear' },
    { href: '/profesor/pendientes', label: 'Pendientes' },
    { href: '/profesor/asignaturas', label: 'Asignaturas' },
  ],
  admin: [{ href: '/admin', label: 'Administración' }],
  super_admin: [{ href: '/admin', label: 'Administración' }],
};

export const roleLabels: Record<Role, string> = {
  student: 'Estudiante',
  teacher: 'Profesor',
  admin: 'Admin',
  super_admin: 'Super admin',
};
