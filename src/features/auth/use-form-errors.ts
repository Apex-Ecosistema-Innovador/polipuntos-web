import { ApiError } from '@/lib/api-client';

export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.details) return {};
  return Object.fromEntries(error.details.map((detail) => [detail.path.split('.')[0], detail.message]));
}
