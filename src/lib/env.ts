export const isLocal = process.env.NODE_ENV !== 'production';

export const securityHeadersDisabled = process.env.DISABLE_SECURITY_HEADERS === 'true';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export const isSameOrigin = (apiUrl: string) => apiUrl.startsWith('/');

export function resolveApiUrl(
  pageHostname?: string,
  options: { configured?: string; local?: boolean } = {},
): string {
  const configured = options.configured ?? configuredApiUrl;
  const local = options.local ?? isLocal;
  if (isSameOrigin(configured)) return configured;
  if (!local || !pageHostname || LOOPBACK_HOSTS.has(pageHostname)) return configured;

  const url = new URL(configured);
  if (!LOOPBACK_HOSTS.has(url.hostname)) return configured;

  url.hostname = pageHostname;
  return url.toString().replace(/\/$/, '');
}

export const apiUrl = () =>
  resolveApiUrl(typeof window === 'undefined' ? undefined : window.location.hostname);

export const apiOriginFor = (pageHostname?: string) => {
  const url = resolveApiUrl(pageHostname);
  return isSameOrigin(url) ? null : new URL(url).origin;
};

export const healthUrl = () => {
  const url = apiUrl();
  return isSameOrigin(url) ? '/api-health' : new URL('/health', url).toString();
};
