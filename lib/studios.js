import { createClient } from '@/lib/supabase/server';

const CAPA_PADRAO =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85';

export function formatPrice(preco) {
  const millions = preco / 1000000;
  if (millions >= 1) {
    return `R$ ${millions.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  }
  return `R$ ${preco.toLocaleString('pt-BR')}`;
}

export function formatPriceFull(preco) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export function coverPhoto(studio) {
  return studio.fotos && studio.fotos.length > 0 ? studio.fotos[0] : CAPA_PADRAO;
}

export const TIPOLOGIA_LABEL = {
  studio: 'Studio',
  'quarto-e-sala': 'Quarto e Sala',
};

export async function listStudios() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('studios')
    .select('*')
    .eq('destaque', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar studios:', error);
    return [];
  }
  return data;
}

export async function listStudiosAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('studios').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao listar studios (admin):', error);
    return [];
  }
  return data;
}

export async function getStudioBySlug(slug) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('studios').select('*').eq('slug', slug).maybeSingle();
  if (error) {
    console.error('Erro ao buscar studio:', error);
    return null;
  }
  return data;
}
