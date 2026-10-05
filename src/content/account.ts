export const institutionalEmailDomain = 'elpoli.edu.co';

export const institutionalEmailHint = `Usa tu correo institucional (@${institutionalEmailDomain}).`;

export const passwordMinLength = 8;

export function institutionalEmailError(email: string): string | undefined {
  const value = email.trim().toLowerCase();
  if (!value) return 'Ingresa tu correo institucional';
  const [local, domain, ...rest] = value.split('@');
  if (!local || rest.length > 0 || /\s/.test(value)) return 'Ingresa un correo válido';
  if (domain !== institutionalEmailDomain) return institutionalEmailHint;
  return undefined;
}
