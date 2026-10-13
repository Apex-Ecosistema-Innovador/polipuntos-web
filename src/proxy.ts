import { NextRequest, NextResponse } from 'next/server';
import { apiOriginFor, isLocal, securityHeadersDisabled } from '@/lib/env';
import { homeFor } from '@/lib/routes';
import { buildContentSecurityPolicy } from '@/lib/security/content-security-policy';
import { parseSessionRole, SESSION_COOKIE } from '@/lib/session-cookie';
import { Role } from '@/types/api';

const protectedAreas: { prefix: string; roles: Role[] }[] = [
  { prefix: '/estudiante', roles: ['student'] },
  { prefix: '/profesor', roles: ['teacher'] },
  { prefix: '/admin', roles: ['admin', 'super_admin'] },
  { prefix: '/cuenta', roles: ['student', 'teacher', 'admin', 'super_admin'] },
];

const guestOnly = ['/login', '/registro', '/registro-profesor'];

const publicAliases: Record<string, string> = {
  '/signin': '/login',
  '/register': '/registro',
};

const roleAliases: Record<string, (role: Role) => string> = {
  '/dashboard': homeFor,
  '/inicio': homeFor,
  '/home': homeFor,
  '/panel': homeFor,
  '/qr': () => '/estudiante/qr',
  '/mi-qr': () => '/estudiante/qr',
  '/escanear': () => '/profesor/escanear',
  '/scan': () => '/profesor/escanear',
  '/pendientes': () => '/profesor/pendientes',
};

const within = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

const redirect = (request: NextRequest, pathname: string, search = '') => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  return NextResponse.redirect(url);
};

const resolveRedirect = (request: NextRequest, role: Role | null): NextResponse | null => {
  const { pathname } = request.nextUrl;

  if (publicAliases[pathname]) return redirect(request, publicAliases[pathname]);

  const roleAlias = roleAliases[pathname];
  if (roleAlias) {
    return role
      ? redirect(request, roleAlias(role))
      : redirect(request, '/login', `?next=${encodeURIComponent(pathname)}`);
  }

  const area = protectedAreas.find(({ prefix }) => within(pathname, prefix));
  if (area) {
    if (!role) return redirect(request, '/login', `?next=${encodeURIComponent(pathname)}`);
    if (!area.roles.includes(role)) return redirect(request, homeFor(role));
  }

  if (role && guestOnly.includes(pathname)) return redirect(request, homeFor(role));

  return null;
};

const requestHostname = (request: NextRequest) => {
  const host = request.headers.get('host');
  try {
    return host ? new URL(`http://${host}`).hostname : request.nextUrl.hostname;
  } catch {
    return request.nextUrl.hostname;
  }
};

const withSecurityPolicy = (request: NextRequest) => {
  const nonce = btoa(crypto.randomUUID());
  const policy = buildContentSecurityPolicy({
    nonce,
    apiOrigin: apiOriginFor(requestHostname(request)),
    development: process.env.NODE_ENV !== 'production',
    upgradeInsecure: !isLocal && (process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://') ?? false),
  });

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', policy);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
};

export function proxy(request: NextRequest) {
  const role = parseSessionRole(request.cookies.get(SESSION_COOKIE)?.value);
  const redirection = resolveRedirect(request, role);
  if (redirection) return redirection;
  return securityHeadersDisabled ? NextResponse.next() : withSecurityPolicy(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
