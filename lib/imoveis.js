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
const SURROUNDINGS_RADIUS_M = 5000;

function classifyPoi(tags) {
  if (tags.amenity === 'bar') return 'bares';
  if (tags.amenity === 'restaurant') return 'restaurantes';
  if (tags.natural === 'beach') return 'praias';
  if (tags.leisure === 'fitness_centre') return 'academias';
  if (tags.amenity === 'pharmacy') return 'farmacias';
  if (tags.shop === 'supermarket' || tags.shop === 'convenience') return 'supermercados';
  return null;
}

const EMPTY_SURROUNDINGS = { bares: [], restaurantes: [], praias: [], academias: [], farmacias: 0, supermercados: 0 };

export function hasSurroundingsContent(surroundings) {
  if (!surroundings) return false;
  return (
    surroundings.bares.length > 0 ||
    surroundings.restaurantes.length > 0 ||
    surroundings.praias.length > 0 ||
    surroundings.academias.length > 0 ||
    surroundings.farmacias > 0 ||
    surroundings.supermercados > 0
  );
}

export async function getNearbySurroundings(lat, lon) {
  const latN = Number(lat);
  const lonN = Number(lon);
  if (!Number.isFinite(latN) || !Number.isFinite(lonN)) return EMPTY_SURROUNDINGS;

  const around = `around:${SURROUNDINGS_RADIUS_M},${latN},${lonN}`;
  const query = `[out:json][timeout:15];(
    node["amenity"="bar"](${around});
    node["amenity"="restaurant"](${around});
    node["natural"="beach"](${around});
    way["natural"="beach"](${around});
    node["leisure"="fitness_centre"](${around});
    node["amenity"="pharmacy"](${around});
    node["shop"~"^(supermarket|convenience)$"](${around});
  );out tags 150;`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json,*/*',
        'User-Agent': 'casacomleo.com.br (contato@casacomleo.com.br)',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return EMPTY_SURROUNDINGS;

    const data = await res.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];

    const bares = new Set();
    const restaurantes = new Set();
    const praias = new Set();
    const academias = new Set();
    let farmacias = 0;
    let supermercados = 0;

    for (const el of elements) {
      if (!el.tags) continue;
      const kind = classifyPoi(el.tags);
      const name = el.tags.name?.trim();
      if (kind === 'bares' && name) bares.add(name);
      else if (kind === 'restaurantes' && name) restaurantes.add(name);
      else if (kind === 'praias' && name) praias.add(name);
      else if (kind === 'academias' && name) academias.add(name);
      else if (kind === 'farmacias') farmacias += 1;
      else if (kind === 'supermercados') supermercados += 1;
    }

    return {
      bares: [...bares].slice(0, 5),
      restaurantes: [...restaurantes].slice(0, 5),
      praias: [...praias].slice(0, 3),
      academias: [...academias].slice(0, 3),
      farmacias,
      supermercados,
    };
  } catch {
    return EMPTY_SURROUNDINGS;
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
