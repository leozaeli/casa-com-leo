const FALLBACK_COVER = 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85';
const RESERVA_DO_SOL_COVER = 'https://azinunes.com.br/empreendimentos/reserva-do-sol/rds/hero-piscina-fachada.webp';

export function buildCatalogItems(imoveis, launches) {
  const launchCards = launches
    .filter((launch) => launch.status === 'published' && !imoveis.some((imovel) => imovel.slug === launch.property_slug))
    .map((launch) => ({
      id: `launch-${launch.id}`,
      slug: launch.subdomain,
      titulo: launch.title,
      localizacao: launch.location || 'Bahia',
      categoria: launch.property_type || (launch.subdomain === 'reservadosol' ? 'apartamento' : 'outro'),
      modalidades: launch.modalities?.length ? launch.modalities : ['venda'],
      preco: 0,
      suites: launch.subdomain === 'reservadosol' ? 2 : null,
      area_m2: null,
      fotos: [launch.subdomain === 'reservadosol' ? RESERVA_DO_SOL_COVER : launch.assets_url || FALLBACK_COVER],
      launch_url: `https://${launch.subdomain}.casacomleo.com.br`,
      is_launch: true,
      destaque: Boolean(launch.destaque),
    }));

  return [...imoveis, ...launchCards];
}
