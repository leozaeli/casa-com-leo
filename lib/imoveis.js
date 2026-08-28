import { createClient } from '@/lib/supabase/server';

const CAPA_PADRAO =
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85';

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

export function coverPhoto(imovel) {
  return imovel.fotos && imovel.fotos.length > 0 ? imovel.fotos[0] : CAPA_PADRAO;
}

export function buildImovelSpecs(imovel) {
  const specs = [];
  if (imovel.area_m2 > 0) specs.push({ value: `${imovel.area_m2} m²`, label: imovel.area_label });
  if (imovel.suites > 0) specs.push({ value: `${imovel.suites}`, label: 'Suítes' });
  if (imovel.vagas > 0) specs.push({ value: `${imovel.vagas}`, label: 'Vagas' });
  return [...specs, ...(imovel.specs_extra || [])];
}

export async function listImoveis() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('imoveis')
    .select('*')
    .eq('destaque', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar imóveis:', error);
    return [];
  }
  return data;
}

export async function listImoveisAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('imoveis').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao listar imóveis (admin):', error);
    return [];
  }
  return data;
}

export async function getImovelById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('imoveis').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('Erro ao buscar imóvel por id:', error);
    return null;
  }
  return data;
}

export async function getImovelBySlug(slug) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('imoveis').select('*').eq('slug', slug).maybeSingle();
  if (error) {
    console.error('Erro ao buscar imóvel:', error);
    return null;
  }
  return data;
}
