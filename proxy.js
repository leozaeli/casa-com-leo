import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const ADMIN_HOST = 'admin.casacomleo.com.br';

export async function proxy(request) {
  const hostname = (request.headers.get('host') || '').split(':')[0];
  const { pathname } = request.nextUrl;
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(pathname);

  if (hasExtension) {
    return NextResponse.next();
  }

  if (hostname === ADMIN_HOST) {
    if (pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    const internalPath = pathname.startsWith('/admin') ? pathname : `/admin${pathname === '/' ? '' : pathname}`;

    let rewriteUrl = null;
    if (internalPath !== pathname) {
      rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = internalPath;
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';

    return updateSession(request, { rewriteUrl, effectivePathname: internalPath, loginUrl });
  }

  if (pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.protocol = 'https';
    url.hostname = ADMIN_HOST;
    url.port = '';
    url.pathname = pathname === '/admin' ? '/' : pathname.slice('/admin'.length);
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
