const FALLBACK_COVER = 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85';
const RESERVA_DO_SOL_COVER = 'https://azinunes.com.br/empreendimentos/reserva-do-sol/rds/hero-piscina-fachada.webp';

export function getLaunchCatalogDetails(launch) {
  const reservaDoSol = launch.subdomain === 'reservadosol';
  return {
    unidades: launch.unidades ?? (reservaDoSol ? 32 : null),
    suites: launch.suites ?? (reservaDoSol ? 2 : null),
    vagas: launch.vagas ?? (reservaDoSol ? 2 : null),
    area_m2: launch.area_m2 ?? (reservaDoSol ? 63.31 : null),
    area_max_m2: launch.area_max_m2 ?? (reservaDoSol ? 67.38 : null),
  };
}

export function buildCatalogItems(imoveis, launches) {
  const launchCards = launches
    .filter((launch) => launch.status === 'published' && !imoveis.some((imovel) => imovel.slug === launch.property_slug))
    .map((launch) => {
      const details = getLaunchCatalogDetails(launch);
      return {
      id: `launch-${launch.id}`,
      slug: launch.subdomain,
      titulo: launch.title,
      localizacao: launch.location || 'Bahia',
      categoria: launch.property_type || (launch.subdomain === 'reservadosol' ? 'apartamento' : 'outro'),
      modalidades: launch.modalities?.length ? launch.modalities : ['venda'],
      preco: 0,
      ...details,
      area_label: details.area_m2 && details.area_max_m2
        ? `${details.area_m2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}–${details.area_max_m2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m²`
        : null,
      fotos: [launch.subdomain === 'reservadosol' ? RESERVA_DO_SOL_COVER : launch.assets_url || FALLBACK_COVER],
      launch_url: `https://${launch.subdomain}.casacomleo.com.br`,
      is_launch: true,
      destaque: Boolean(launch.destaque),
      };
    });

  return [...imoveis, ...launchCards];
}
