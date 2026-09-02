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

export function formatSpecItem(spec) {
  const rawVal = spec?.value?.toString().trim() || '';
  const rawLabel = spec?.label?.toString().trim() || '';
  const hasVal = rawVal && rawVal !== '-';
  const hasLabel = rawLabel && rawLabel !== '-';

  if (!hasVal && !hasLabel) return null;

  let title = '';
  let subtitle = null;

  if (hasVal && hasLabel) {
    if (rawVal.toLowerCase() === 'sim' || rawVal.toLowerCase() === 'possui') {
      title = rawLabel;
    } else {
      title = rawVal;
      subtitle = rawLabel;
    }
  } else if (hasVal) {
    title = rawVal;
  } else {
    title = rawLabel;
  }

  return { title, subtitle };
}

export function specSizeClass({ title, subtitle }) {
  const len = (title?.length || 0) + (subtitle?.length || 0);
  if (len > 60) return 'spec--full';
  if (len > 38) return 'spec--lg';
  if (len > 22) return 'spec--md';
  return '';
}

const OSM_BBOX_DELTA = 0.006;

function buildOsmEmbed(lat, lon) {
  const latN = Number(lat);
  const lonN = Number(lon);
  if (!Number.isFinite(latN) || !Number.isFinite(lonN)) return null;
  const bbox = [lonN - OSM_BBOX_DELTA, latN - OSM_BBOX_DELTA, lonN + OSM_BBOX_DELTA, latN + OSM_BBOX_DELTA]
    .map((n) => n.toFixed(6))
    .join('%2C');
  return {
    embedSrc: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latN}%2C${lonN}`,
    lat: latN,
    lon: lonN,
  };
}

async function geocodeAddress(address) {
  const query = address?.trim();
  if (!query) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': 'casacomleo.com.br (contato@casacomleo.com.br)' } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data[0]) return { lat: data[0].lat, lon: data[0].lon };
  } catch {
    // segue sem coordenadas
  }
  return null;
}

export async function resolveMapEmbed(rawLocation) {
  const raw = (rawLocation || '').toString().trim();
  if (!raw) return null;

  const [addressPart, coordsPart] = raw.split('|');
  if (coordsPart) {
    const coordMatch = coordsPart.trim().match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
    if (coordMatch) {
      const embed = buildOsmEmbed(coordMatch[1], coordMatch[2]);
      if (embed) return embed;
    }
  }

  const base = (addressPart || raw).trim();
  let target = base;
  if (/^https?:\/\//i.test(base) && /goo\.gl|maps\.app\.goo\.gl/i.test(base)) {
    try {
      const res = await fetch(base, { redirect: 'follow' });
      target = res.url || base;
    } catch {
      target = base;
    }
  }

  const linkCoordMatch =
    target.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    target.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    target.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (linkCoordMatch) {
    const embed = buildOsmEmbed(linkCoordMatch[1], linkCoordMatch[2]);
    if (embed) return embed;
  }

  const placeMatch = target.match(/\/maps\/place\/([^/@]+)/i);
  const searchText = placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')) : base;
  if (/^https?:\/\//i.test(searchText)) return null;

  const geocoded = await geocodeAddress(searchText);
  if (!geocoded) return null;
  return buildOsmEmbed(geocoded.lat, geocoded.lon);
}

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

const HIGHLIGHT_CATEGORIES = [
  { label: 'Praia por perto', radius: 3000, match: (tags) => tags.natural === 'beach' },
  { label: 'Mercados por perto', radius: 1200, match: (tags) => tags.shop === 'supermarket' || tags.shop === 'convenience' },
  { label: 'Farmácias por perto', radius: 1200, match: (tags) => tags.amenity === 'pharmacy' },
  {
    label: 'Bares e restaurantes por perto',
    radius: 1200,
    match: (tags) => ['restaurant', 'bar', 'cafe'].includes(tags.amenity),
  },
];

export async function getNearbyHighlights(lat, lon) {
  const latN = Number(lat);
  const lonN = Number(lon);
  if (!Number.isFinite(latN) || !Number.isFinite(lonN)) return [];

  const query = `[out:json][timeout:10];(
    node["natural"="beach"](around:3000,${latN},${lonN});
    way["natural"="beach"](around:3000,${latN},${lonN});
    node["shop"~"^(supermarket|convenience)$"](around:1200,${latN},${lonN});
    node["amenity"="pharmacy"](around:1200,${latN},${lonN});
    node["amenity"~"^(restaurant|bar|cafe)$"](around:1200,${latN},${lonN});
  );out tags 80;`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json,*/*',
        'User-Agent': 'casacomleo.com.br (contato@casacomleo.com.br)',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];

    return HIGHLIGHT_CATEGORIES.filter((category) => elements.some((el) => el.tags && category.match(el.tags))).map(
      (category) => category.label
    );
  } catch {
    return [];
  }
}

export function buildImovelSpecs(imovel) {
  const specs = [];
  if (imovel.area_m2 > 0) specs.push({ value: `${imovel.area_m2} m²`, label: imovel.area_label || 'Área construída' });
  if (imovel.suites > 0) specs.push({ value: `${imovel.suites}`, label: imovel.suites === 1 ? 'Suíte' : 'Suítes' });
  if (imovel.vagas > 0) specs.push({ value: `${imovel.vagas}`, label: imovel.vagas === 1 ? 'Vaga' : 'Vagas' });
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
