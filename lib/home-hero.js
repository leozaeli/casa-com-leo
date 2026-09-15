import { createAdminClient } from '@/lib/supabase/server';

export const DEFAULT_HOME_HERO = {
  kicker: 'SALVADOR & LITORAL NORTE',
  titleLineOne: 'Seu próximo',
  titleLineTwo: 'capítulo.',
  intro: 'Casas que surpreendem.\nEscolhas que fazem sentido.',
  ctaLabel: 'Encontre seu lugar',
  scenes: [
    { desktop: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=85', mobile: '', alt: 'Arquitetura contemporânea com jardim e piscina', label: 'Arquitetura que inspira' },
    { desktop: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1920&q=85', mobile: '', alt: 'Sala ampla com luz natural e integração dos ambientes', label: 'Espaço para viver' },
    { desktop: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1920&q=85', mobile: '', alt: 'Interior contemporâneo aberto para a paisagem', label: 'Um novo olhar' },
  ],
};

function normalizeHero(value) {
  const source = value && typeof value === 'object' ? value : {};
  const scenes = Array.isArray(source.scenes) ? source.scenes : [];
  return { ...DEFAULT_HOME_HERO, ...source, scenes: DEFAULT_HOME_HERO.scenes.map((fallback, index) => ({ ...fallback, ...(scenes[index] || {}) })) };
}

export async function getHomeHero() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('site_content').select('value').eq('key', 'home_hero').maybeSingle();
    return error || !data?.value ? DEFAULT_HOME_HERO : normalizeHero(data.value);
  } catch { return DEFAULT_HOME_HERO; }
}
