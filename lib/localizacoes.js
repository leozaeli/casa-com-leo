import { createClient } from '@/lib/supabase/server';

export async function listLocalizacoes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('localizacoes').select('*').order('nome', { ascending: true });
  if (error) {
    console.error('Erro ao listar localizações:', error);
    return [];
  }
  return data;
}
