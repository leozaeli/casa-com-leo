import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getLaunchSlugByHostname, getLaunchUrl } from '@/lib/launches';

const ADMIN_HOST = 'admin.casacomleo.com.br';
const MODELO_HOST = 'modelo.casacomleo.com.br';

export async function proxy(request) {
  const hostname = (request.headers.get('host') || '').split(':')[0];
  const { pathname } = request.nextUrl;
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(pathname);

  if (hasExtension) {
    return NextResponse.next();
  }

  const launchSlug = getLaunchSlugByHostname(hostname);
  if (launchSlug) {
    if (pathname === '/') {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/lancamentos/${launchSlug}`;
      return NextResponse.rewrite(rewriteUrl);
    }

    const siteUrl = request.nextUrl.clone();
    siteUrl.protocol = 'https';
    siteUrl.hostname = 'casacomleo.com.br';
    siteUrl.port = '';
    return NextResponse.redirect(siteUrl, 308);
  }

  if (hostname === MODELO_HOST) {
    const internalPath = pathname.startsWith('/modelo') ? pathname : `/modelo${pathname === '/' ? '' : pathname}`;
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (pathname.startsWith('/modelo')) {
    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname = `/nao-encontrado${pathname}`;
    return NextResponse.rewrite(notFoundUrl);
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

  if (hostname.endsWith('.casacomleo.com.br') && hostname !== ADMIN_HOST && hostname !== MODELO_HOST && !hostname.startsWith('www.')) {
    const subdomain = hostname.slice(0, -'.casacomleo.com.br'.length);
    if (subdomain && pathname === '/') {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/lancamentos/${subdomain}`;
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  const launchMatch = pathname.match(/^\/lancamentos\/([^/]+)\/?$/);
  if ((hostname === 'casacomleo.com.br' || hostname === 'www.casacomleo.com.br') && launchMatch) {
    const launchUrl = getLaunchUrl(launchMatch[1]);
    if (launchUrl.startsWith('https://')) {
      const redirectUrl = new URL(launchUrl);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
