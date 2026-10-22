import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'luna.com';
  const cleanHost = host.split(':')[0].toLowerCase();

  // 1. Explicit path development route: /tenant/[tenantId] or /tenant/[tenantId]/staff
  if (pathname.startsWith('/tenant/')) {
    return NextResponse.next();
  }

  // 2. Subdomain host resolution in production & local development:
  // e.g., acme-bank.luna.com OR acme-bank.localhost:3000 -> rewrites to /tenant/acme-bank
  let subdomain: string | null = null;

  if (cleanHost.endsWith(`.${platformDomain}`)) {
    subdomain = cleanHost.replace(`.${platformDomain}`, '');
  } else if (cleanHost.endsWith('.localhost')) {
    subdomain = cleanHost.replace('.localhost', '');
  }

  if (subdomain && subdomain !== 'app' && subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== '127.0.0.1') {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/tenant/${subdomain}`, request.url));
    }
    if (pathname.startsWith('/staff')) {
      return NextResponse.rewrite(new URL(`/tenant/${subdomain}${pathname}`, request.url));
    }
    return NextResponse.rewrite(new URL(`/tenant/${subdomain}${pathname}`, request.url));
  }

  // 3. Platform app resolution: app.luna.com -> rewrites to /platform/dashboard
  if (cleanHost === `app.${platformDomain}`) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/platform/dashboard', request.url));
    }
    if (!pathname.startsWith('/platform')) {
      return NextResponse.rewrite(new URL(`/platform${pathname}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
