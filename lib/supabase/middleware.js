import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request, { rewriteUrl, effectivePathname, loginUrl } = {}) {
  const makeResponse = () => (rewriteUrl ? NextResponse.rewrite(rewriteUrl, { request }) : NextResponse.next({ request }));
  let supabaseResponse = makeResponse();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = makeResponse();
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = effectivePathname ?? request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminUser = Boolean(user && user.email === process.env.ADMIN_EMAIL);

  if (isAdminRoute && !isAdminUser) {
    const url = loginUrl ?? (() => {
      const fallback = request.nextUrl.clone();
      fallback.pathname = '/admin/login';
      return fallback;
    })();
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
