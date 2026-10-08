export const CEDULA_MIN = 5;
export const CEDULA_MAX = 12;
export const COURSE_CODE_MAX = 30;
export const PASSWORD_MIN = 8;

const TERM_PATTERN = /^20\d{2}-[12]$/;
const COURSE_CODE_PATTERN = /^[A-Z0-9]+$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u;

export const sanitizeCedula = (value: string) => value.replace(/\D/g, '').slice(0, CEDULA_MAX);

export const sanitizeCourseCode = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, COURSE_CODE_MAX);

export const sanitizeTerm = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 5);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
};

export const sanitizeName = (value: string) =>
  value
    .replace(/[^\p{L}\s'.-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, 150);

export const sanitizeInviteCode = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 40);

export function cedulaError(value: string): string | undefined {
  if (!value) return 'Ingresa tu cédula';
  if (value.length < CEDULA_MIN || value.length > CEDULA_MAX) {
    return `La cédula debe tener entre ${CEDULA_MIN} y ${CEDULA_MAX} dígitos`;
  }
  return undefined;
}

export function nameError(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length < 3) return 'Ingresa tu nombre completo';
  if (!NAME_PATTERN.test(trimmed)) return 'El nombre solo puede tener letras y espacios';
  return undefined;
}

export function passwordError(value: string): string | undefined {
  if (value.length < PASSWORD_MIN) return `Mínimo ${PASSWORD_MIN} caracteres`;
  return undefined;
}

export function courseCodeError(value: string): string | undefined {
  if (!value) return 'Ingresa el código de la asignatura';
  if (!COURSE_CODE_PATTERN.test(value)) return 'Usa solo letras mayúsculas y números, por ejemplo ING001';
  return undefined;
}

export function courseNameError(value: string): string | undefined {
  if (value.trim().length < 2) return 'Ingresa el nombre de la asignatura';
  return undefined;
}

export function termError(value: string): string | undefined {
  if (!TERM_PATTERN.test(value)) return 'Usa el formato año-semestre, por ejemplo 2026-2';
  return undefined;
}

export const firstError = (errors: Record<string, string | undefined>) =>
  Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as Record<string, string>;
