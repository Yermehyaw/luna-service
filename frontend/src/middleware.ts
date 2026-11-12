import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  const platformDomain =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'withluna.tech';
  const cleanHost = host.split(':')[0].toLowerCase();

  // 1. Pass through internal Next.js assets, API routes, manifest, favicon, etc.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js'
  ) {
    return NextResponse.next();
  }

  // 2. Explicit path development route: /tenant/[tenantId] or /tenant/[tenantId]/staff
  if (pathname.startsWith('/tenant/')) {
    return NextResponse.next();
  }

  // 3. Subdomain host resolution:
  // e.g., kemis-lounge.withluna.tech OR kemis-lounge.localhost:3000
  let subdomain: string | null = null;

  if (cleanHost.endsWith(`.${platformDomain}`)) {
    subdomain = cleanHost.replace(`.${platformDomain}`, '');
  } else if (cleanHost.endsWith('.localhost')) {
    subdomain = cleanHost.replace('.localhost', '');
  }

  // Ignore reserved top-level subdomains: www, app, api, admin, staging, localhost, 127.0.0.1
  const reservedSubdomains = new Set([
    'www',
    'app',
    'api',
    'admin',
    'staging',
    'localhost',
    '127.0.0.1',
  ]);

  if (subdomain && !reservedSubdomains.has(subdomain)) {
    // When visiting on a tenant subdomain:
    // e.g. kemis-lounge.withluna.tech/ -> rewrites to /tenant/kemis-lounge
    // e.g. kemis-lounge.withluna.tech/book-queue -> rewrites to /tenant/kemis-lounge/book-queue
    // e.g. kemis-lounge.withluna.tech/staff/ops-console -> rewrites to /tenant/kemis-lounge/staff/ops-console
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/tenant/${subdomain}`, request.url));
    }
    return NextResponse.rewrite(
      new URL(`/tenant/${subdomain}${pathname}`, request.url)
    );
  }

  // 4. Platform app resolution: app.withluna.tech -> rewrites to /dashboard
  if (cleanHost === `app.${platformDomain}`) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
