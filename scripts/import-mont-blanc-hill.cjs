const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = {};
for (const line of fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8').split(/\r?\n/)) {
  const separator = line.indexOf('=');
  if (separator > 0) env[line.slice(0, separator)] = line.slice(separator + 1).replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const slug = 'mont-blanc-hill';
const sourceBase = 'https://azinunes.com.br/empreendimentos/mont-blanc-hill/mbh';
const sourceImages = [
  'hero-torre.webp',
  'torre-aerea.webp',
  'acesso.webp',
  'living.webp',
  'suite-master.webp',
  'suite-office.webp',
  'varanda-gourmet.webp',
  'piscina-podio.webp',
  'piscina-familia.webp',
  'gourmet-quiosque.webp',
  'quiosque-jantar.webp',
  'game-room.webp',
];

async function main() {
  const { data: existing, error: existingError } = await supabase.from('imoveis').select('id').eq('slug', slug).maybeSingle();
  if (existingError) throw existingError;
  if (existing) throw new Error(`O imóvel /imoveis/${slug} já existe.`);

  const locationSlug = 'caminho-das-arvores';
  const { data: location, error: locationError } = await supabase
    .from('localizacoes')
    .upsert({ nome: 'Caminho das Árvores', slug: locationSlug }, { onConflict: 'slug' })
    .select('nome')
    .single();
  if (locationError) throw locationError;

  const stamp = Date.now();
  const uploadedPaths = [];

  try {
    const fotos = [];
    for (const [index, filename] of sourceImages.entries()) {
      const response = await fetch(`${sourceBase}/${filename}`);
      if (!response.ok) throw new Error(`Não foi possível obter ${filename} (${response.status}).`);

      const uploadPath = `${slug}/${stamp}-${index}.webp`;
      const { error: uploadError } = await supabase.storage.from('imoveis-fotos').upload(uploadPath, Buffer.from(await response.arrayBuffer()), {
        contentType: 'image/webp',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      uploadedPaths.push(uploadPath);
      fotos.push(supabase.storage.from('imoveis-fotos').getPublicUrl(uploadPath).data.publicUrl);
    }

    const { error: insertError } = await supabase.from('imoveis').insert({
      slug,
      titulo: 'Mont Blanc Hill',
      eyebrow: 'Apartamento · Caminho das Árvores',
      localizacao: `${location.nome} · Salvador`,
      localizacao_filtro: locationSlug,
      categoria: 'apartamento',
      modalidades: ['venda'],
      preco: 0,
      area_m2: 133.81,
      area_total_m2: null,
      quartos: 3,
      suites: 3,
      vagas: 2,
      headline: 'Um endereço nobre para viver com mais presença.',
      paragrafo_1:
        'Na Alameda dos Sombreiros, o Mont Blanc Hill encontra o ritmo tranquilo do Caminho das Árvores com uma arquitetura contemporânea, varandas verdejantes e luz natural em todos os ambientes.',
      paragrafo_2:
        'São plantas de 133,81 m², três suítes e varanda gourmet, pensadas para uma rotina que alterna entre acolhimento, encontros e respiro. O lazer completa a experiência com piscina de borda infinita, espaços sociais e áreas para o bem-estar.',
      specs_extra: [
        { value: 'Nascente total', label: 'Orientação' },
        { value: 'Obras avançadas', label: 'Status' },
        { value: 'Varanda gourmet', label: 'Diferencial' },
      ],
      fotos,
      destaque: true,
      mapa_url: 'Alameda dos Sombreiros, 476, Caminho das Árvores, Salvador, BA',
      entorno_texto:
        'Uma rua arborizada, com acesso próximo a shoppings, escolas, restaurantes e aos principais centros empresariais de Salvador.',
    });
    if (insertError) throw insertError;

    console.log(JSON.stringify({ success: true, url: `https://casacomleo.com.br/imoveis/${slug}`, fotos: fotos.length }));
  } catch (error) {
    if (uploadedPaths.length) await supabase.storage.from('imoveis-fotos').remove(uploadedPaths);
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
