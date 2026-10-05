import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'APEX Polipuntos',
    short_name: 'Polipuntos',
    description: 'Registro y seguimiento de polipuntos del modelo APEX.',
    lang: 'es-CO',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#08090a',
    theme_color: '#08090a',
    categories: ['education'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Mi QR', url: '/estudiante/qr', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      {
        name: 'Escanear',
        url: '/profesor/escanear',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
