import { createAdminClient } from '@/lib/supabase/server';

export async function listLaunchBriefs() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('site_content').select('value').eq('key', 'launches').maybeSingle();
  if (error) {
    console.error('Erro ao listar lançamentos:', error);
    return [];
  }
  return Array.isArray(data?.value) ? data.value : [];
}

export async function getLaunchBrief(identifier) {
  const launches = await listLaunchBriefs();
  return launches.find((launch) => launch.subdomain === identifier || launch.property_slug === identifier) || null;
}
