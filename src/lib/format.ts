export const initialsOf = (fullName: string) =>
  fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export const formatPoints = (points: number) => (points > 0 ? `+${points}` : String(points));

export const formatCedula = (cedula: string) => cedula.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Ocurrió un error');
