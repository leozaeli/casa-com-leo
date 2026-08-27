import { createAdminClient } from '@/lib/supabase/server';

function startOfDayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getVisitStats() {
  const admin = createAdminClient();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = startOfDayISO();

  const [{ count: today }, { count: week }, { data: recentPaths }] = await Promise.all([
    admin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    admin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
    admin.from('page_views').select('path').gte('created_at', since7d).limit(3000),
  ]);

  const counts = {};
  (recentPaths || []).forEach((row) => {
    counts[row.path] = (counts[row.path] || 0) + 1;
  });
  const topPages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, count]) => ({ path, count }));

  return { today: today || 0, week: week || 0, topPages };
}

export async function getRecentLeads(limit = 8) {
  const admin = createAdminClient();
  const { data } = await admin.from('leads').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function getLeadStats() {
  const admin = createAdminClient();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', since7d);
  return { week: count || 0 };
}
