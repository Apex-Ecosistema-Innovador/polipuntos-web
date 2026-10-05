const SW_URL = '/sw.js';

const supported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production';

export async function registerServiceWorker(onUpdateReady: (apply: () => void) => void) {
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
