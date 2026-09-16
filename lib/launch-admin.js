import { createClient } from '@/lib/supabase/server';

export async function listLaunchBriefs() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_content').select('value').eq('key', 'launches').maybeSingle();
  if (error) {
    console.error('Erro ao listar lançamentos:', error);
    return [];
  }
  return Array.isArray(data?.value) ? data.value : [];
}
