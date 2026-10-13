import type { NextConfig } from 'next';

const isProductionBuild = process.env.NODE_ENV === 'production';
const isLocal = !isProductionBuild;
const securityHeadersDisabled = process.env.DISABLE_SECURITY_HEADERS === 'true';

const baseHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
];

const hardenedHeaders = [
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isProductionBuild
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),
];

const localNetworkOrigins = ['192.168.*.*', '10.*.*.*', '172.*.*.*', '*.local'];

const extraDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: isLocal ? [...localNetworkOrigins, ...extraDevOrigins] : extraDevOrigins,
  async headers() {
    return [
      ...(securityHeadersDisabled
        ? []
        : [{ source: '/(.*)', headers: isLocal ? baseHeaders : [...baseHeaders, ...hardenedHeaders] }]),
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
