const { Client } = require('pg');
const fs = require('fs');

const COVER = 'https://azinunes.com.br/empreendimentos/reserva-do-sol/rds/hero-piscina-fachada.webp';
const REFERENCE = 'https://azinunes.com.br/empreendimentos/reserva-do-sol/rds/';

async function migrate() {
  const envFile = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
  const env = Object.fromEntries(envFile.split(/\r?\n/).map((line) => line.match(/^([^#=]+)=(.*)$/)).filter(Boolean).map(([, key, value]) => [key, value.replace(/^"|"$/g, '')]));
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL;
  if (!connectionString) throw new Error('Nenhuma URL de conexão Postgres está disponível.');
  const normalizedConnectionString = connectionString.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '');
  const client = new Client({ connectionString: normalizedConnectionString, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('begin');
    await client.query('alter table public.imoveis add column if not exists is_launch boolean not null default false');
    await client.query('alter table public.imoveis add column if not exists reference_url text');

    const { rows: locations } = await client.query('select slug, nome from public.localizacoes order by nome');
    const location = locations.find((item) => item.slug === 'itacimirim' || item.nome.toLowerCase().includes('itacimirim'));
    if (!location) throw new Error('A localização Itacimirim não está cadastrada. Crie-a antes de executar a migração.');

    const { rows: existing } = await client.query("select id from public.imoveis where slug = 'reserva-do-sol' limit 1");
    if (existing.length === 0) {
      await client.query(
        `insert into public.imoveis (slug, titulo, eyebrow, localizacao, localizacao_filtro, categoria, modalidades, preco, area_m2, area_total_m2, quartos, suites, vagas, headline, paragrafo_1, paragrafo_2, specs_extra, fotos, destaque, vendido, is_launch, reference_url)
         values ('reserva-do-sol', 'Reserva do Sol', 'Lançamento · Itacimirim', 'Itacimirim · Bahia', $1, 'apartamento', array['venda'], 0, 63.31, 67.38, 2, 2, 2, 'Seu refúgio em Itacimirim.', 'Apartamentos de 2 suítes entre águas cristalinas, natureza e tempo de qualidade.', 'São 32 unidades, com plantas de 63,31 m² a 67,38 m² e opções térreas com jardim.', $2::jsonb, array[$3], false, false, true, $4)`,
        [location.slug, JSON.stringify([{ value: '32', label: 'Unidades' }, { value: '63,31 m²', label: 'Metragem inicial' }, { value: '67,38 m²', label: 'Maior planta' }]), COVER, REFERENCE]
      );
    }

    await client.query("update public.imoveis set is_launch = true where slug = 'mont-blanc-hill'");

    const { rows: catalog } = await client.query("select slug, titulo, destaque, is_launch from public.imoveis where slug in ('mont-blanc-hill', 'reserva-do-sol') order by slug");
    await client.query('commit');
    console.log(JSON.stringify({ migrated: true, location: location.slug, created: existing.length === 0, catalog }));
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error(JSON.stringify({ message: error.message, code: error.code, cause: error.cause?.message }));
  process.exit(1);
});
