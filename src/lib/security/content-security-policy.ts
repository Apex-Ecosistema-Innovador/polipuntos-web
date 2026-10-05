interface PolicyOptions {
  nonce: string;
  apiOrigin: string;
  development?: boolean;
  upgradeInsecure?: boolean;
}

export function buildContentSecurityPolicy({
  nonce,
  apiOrigin,
  development = false,
  upgradeInsecure = false,
}: PolicyOptions): string {
  const scriptSources = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "'wasm-unsafe-eval'"];
  const styleSources = development ? ["'self'", "'unsafe-inline'"] : ["'self'", `'nonce-${nonce}'`];

  if (development) scriptSources.push("'unsafe-eval'");

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': scriptSources,
    'style-src': styleSources,
    'style-src-attr': ["'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", apiOrigin],
    'media-src': ["'self'", 'blob:'],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
    'object-src': ["'none'"],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  const rendered = Object.entries(directives).map(([name, sources]) => `${name} ${sources.join(' ')}`);
  if (upgradeInsecure) rendered.push('upgrade-insecure-requests');

  return rendered.join('; ');
}
