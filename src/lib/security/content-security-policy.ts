interface PolicyOptions {
  nonce: string;
  apiOrigin: string;
  development?: boolean;
}

export function buildContentSecurityPolicy({ nonce, apiOrigin, development = false }: PolicyOptions): string {
  const scriptSources = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "'wasm-unsafe-eval'"];
  const styleSources = ["'self'", `'nonce-${nonce}'`];

  if (development) {
    scriptSources.push("'unsafe-eval'");
    styleSources.push("'unsafe-inline'");
  }

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
  if (!development) rendered.push('upgrade-insecure-requests');

  return rendered.join('; ');
}
