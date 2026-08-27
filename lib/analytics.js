import { createAdminClient } from '@/lib/supabase/server';

function startOfDayISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

const OWN_HOSTS = ['casacomleo.com.br', 'www.casacomleo.com.br', 'admin.casacomleo.com.br'];

export async function getVisitStats() {
  const admin = createAdminClient();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = startOfDayISO().toISOString();

  const [{ count: today }, { count: week }, { data: recentPaths }] = await Promise.all([
    admin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    admin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
    admin.from('page_views').select('path').gte('created_at', since7d).limit(3000),
  ]);

  const counts = {};
  (recentPaths || []).forEach((row) => {
    counts[row.path] = (counts[row.path] || 0) + 1;
  });

  const isPropertyPath = (path) => path.startsWith('/imoveis/') || path.startsWith('/studios/');

  const topPages = Object.entries(counts)
    .filter(([path]) => !isPropertyPath(path))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, count]) => ({ path, count }));

  const topProperties = Object.entries(counts)
    .filter(([path]) => isPropertyPath(path))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, count]) => ({ path, count }));

  return { today: today || 0, week: week || 0, topPages, topProperties };
}

export async function getVisitTrend(days = 14) {
  const admin = createAdminClient();
  const since = startOfDayISO(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));
  const { data } = await admin.from('page_views').select('created_at').gte('created_at', since.toISOString()).limit(10000);

  const buckets = {};
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    buckets[dayKey(d)] = 0;
  }
  (data || []).forEach((row) => {
    const key = row.created_at.slice(0, 10);
    if (key in buckets) buckets[key] += 1;
  });

  return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}

export async function getTopReferrers(limit = 6) {
  const admin = createAdminClient();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await admin.from('page_views').select('referrer').gte('created_at', since7d).limit(3000);

  const counts = { Direto: 0 };
  (data || []).forEach((row) => {
    if (!row.referrer) {
      counts.Direto += 1;
      return;
    }
    let host;
    try {
      host = new URL(row.referrer).hostname.replace(/^www\./, '');
    } catch {
      return;
    }
    if (OWN_HOSTS.includes(host) || OWN_HOSTS.includes(`www.${host}`)) return;
    counts[host] = (counts[host] || 0) + 1;
  });

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([source, count]) => ({ source, count }));
}

export async function getTopLocalities(limit = 6) {
  const admin = createAdminClient();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await admin.from('page_views').select('city, region, country').gte('created_at', since7d).limit(3000);

  const counts = {};
  (data || []).forEach((row) => {
    const label = [row.city, row.region].filter(Boolean).join(', ') || row.country || 'Desconhecida';
    counts[label] = (counts[label] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([place, count]) => ({ place, count }));
}

export async function getRecentLeads(limit = 8) {
  const admin = createAdminClient();
  const { data } = await admin.from('leads').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function getLeadStats() {
  const admin = createAdminClient();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count, data } = await admin.from('leads').select('canal', { count: 'exact' }).gte('created_at', since7d);

  const byCanal = {};
  (data || []).forEach((row) => {
    const canal = row.canal || 'formulario';
    byCanal[canal] = (byCanal[canal] || 0) + 1;
  });

  return { week: count || 0, byCanal };
}
