import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const sessionId = body.session_id?.toString().slice(0, 100);
  const path = body.path?.toString().slice(0, 300) || '/';
  const type = body.type === 'heartbeat' ? 'heartbeat' : 'pageview';
  if (!sessionId) return new Response(null, { status: 400 });

  const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || null;
  const region = request.headers.get('x-vercel-ip-country-region') || null;
  const cityRaw = request.headers.get('x-vercel-ip-city');
  const city = cityRaw ? decodeURIComponent(cityRaw) : null;
  const referrer = request.headers.get('referer') || null;

  const admin = createAdminClient();

  if (type === 'pageview') {
    await admin.from('page_views').insert({ session_id: sessionId, path, referrer, country, region, city });
  }

  await admin.from('presence').upsert(
    { session_id: sessionId, path, country, region, city, last_seen: new Date().toISOString() },
    { onConflict: 'session_id' }
  );

  return new Response(null, { status: 204 });
}
