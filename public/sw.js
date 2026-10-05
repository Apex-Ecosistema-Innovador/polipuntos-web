const VERSION = 'v1';
const STATIC_CACHE = `apex-static-${VERSION}`;
const PAGE_CACHE = `apex-pages-${VERSION}`;
const OFFLINE_URL = '/offline';
const STATIC_PATH = /^\/(_next\/static|brand|icons|vendor)\//;
const ASSET_REFERENCE = /(?:\/_next\/)?(static\/(?:chunks|css|media)\/[\w\-.~%/]+\.(?:js|css|woff2?|wasm))/g;
const NAVIGATION_TIMEOUT_MS = 5000;

const isStaticPath = (path) => STATIC_PATH.test(path);

async function storeAsset(url) {
  const cache = await caches.open(STATIC_CACHE);
  if (await cache.match(url)) return;
  const response = await fetch(url);
  if (response.ok) await cache.put(url, response);
}

async function storePage(url) {
  const response = await fetch(url, { cache: 'reload' });
  if (!response.ok || response.redirected) return;

  const html = await response.clone().text();
  const cache = await caches.open(PAGE_CACHE);
  await cache.put(url, response);

  const assets = new Set();
  for (const match of html.matchAll(ASSET_REFERENCE)) assets.add(`/_next/${match[1]}`);
  await Promise.allSettled([...assets].map(storeAsset));
}

const warm = (urls) =>
  Promise.allSettled(
    urls.map((url) =>
      isStaticPath(new URL(url, self.location.origin).pathname) ? storeAsset(url) : storePage(url),
    ),
  );

async function fetchWithTimeout(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NAVIGATION_TIMEOUT_MS);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function handleNavigation(request) {
  try {
    const response = await fetchWithTimeout(request);
    if (response.ok && !response.redirected && response.type === 'basic') {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(request.url, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(PAGE_CACHE);
    const cached = await cache.match(request.url, { ignoreSearch: true });
    if (cached) return cached;

    const target = new URL(request.url);
    if (target.pathname === OFFLINE_URL) return Response.error();
    return Response.redirect(
      `${OFFLINE_URL}?from=${encodeURIComponent(target.pathname + target.search)}`,
      302,
    );
  }
}

async function handleStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(storePage(OFFLINE_URL));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('apex-') && ![STATIC_CACHE, PAGE_CACHE].includes(name))
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  const message = event.data;
  if (message?.type === 'SKIP_WAITING') self.skipWaiting();
  if (message?.type === 'WARM' && Array.isArray(message.urls)) event.waitUntil(warm(message.urls));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isStaticPath(url.pathname)) event.respondWith(handleStatic(request));
});
