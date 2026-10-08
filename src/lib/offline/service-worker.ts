const SW_URL = '/sw.js';

const supported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production';

async function clearServiceWorkers() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  const names = await caches.keys();
  await Promise.all(names.filter((name) => name.startsWith('apex-')).map((name) => caches.delete(name)));
}

export async function registerServiceWorker(onUpdateReady: (apply: () => void) => void) {
  if (process.env.NODE_ENV !== 'production') {
    await clearServiceWorkers();
    return;
  }
  if (!supported()) return;

  const registration = await navigator.serviceWorker.register(SW_URL, { scope: '/' });

  const announce = (worker: ServiceWorker) =>
    onUpdateReady(() => {
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
      worker.postMessage({ type: 'SKIP_WAITING' });
    });

  if (registration.waiting && navigator.serviceWorker.controller) announce(registration.waiting);

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    installing?.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) announce(installing);
    });
  });
}

export async function warmServiceWorker(urls: string[]) {
  if (!supported()) return;
  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({ type: 'WARM', urls });
}
