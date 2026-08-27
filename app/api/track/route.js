import { createAdminClient } from '@/lib/supabase/server';

function getVisitorIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    (forwarded ? forwarded.split(',')[0].trim() : null) ||
    null
  );
}

async function lookupGeoByIp(ip) {
  if (!ip) return null;
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'casacomleo-analytics/1.0' },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return {
      country: data.country_code || data.country_name || null,
      region: data.region || null,
      city: data.city || null,
    };
  } catch {
    return null;
  }
}

function headerGeoFallback(request) {
  const cityRaw = request.headers.get('x-vercel-ip-city');
  return {
    country: request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || null,
    region: request.headers.get('x-vercel-ip-country-region') || null,
    city: cityRaw ? decodeURIComponent(cityRaw) : null,
  };
}

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

  const admin = createAdminClient();

  if (type === 'heartbeat') {
    await admin.from('presence').update({ path, last_seen: new Date().toISOString() }).eq('session_id', sessionId);
    return new Response(null, { status: 204 });
  }

  const visitorIp = getVisitorIp(request);
  const geo = (await lookupGeoByIp(visitorIp)) || headerGeoFallback(request);
  const referrer = request.headers.get('referer') || null;
  const userAgent = request.headers.get('user-agent') || null;

  await admin.from('page_views').insert({
    session_id: sessionId,
    path,
    referrer,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    user_agent: userAgent,
  });

  await admin.from('presence').upsert(
    { session_id: sessionId, path, country: geo.country, region: geo.region, city: geo.city, last_seen: new Date().toISOString() },
    { onConflict: 'session_id' }
  );

  return new Response(null, { status: 204 });
}
