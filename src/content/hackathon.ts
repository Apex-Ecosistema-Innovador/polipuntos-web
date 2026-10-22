import type { RegistrationStatus } from '@/types/api';

export const registrationStatusLabel: Record<RegistrationStatus, string> = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  EN_LISTA_ESPERA: 'Lista de espera',
};

export const registrationStatusTone = {
  PENDIENTE: 'yellow',
  APROBADA: 'green',
  RECHAZADA: 'danger',
  EN_LISTA_ESPERA: 'purple',
} as const;

export const registrationStatusOptions = (Object.keys(registrationStatusLabel) as RegistrationStatus[]).map(
  (value) => ({ value, label: registrationStatusLabel[value] }),
);

export const verificationOptions = [
  { value: 'true', label: 'Correo verificado' },
  { value: 'false', label: 'Correo sin verificar' },
];
