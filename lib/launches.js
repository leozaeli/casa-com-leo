const LAUNCHES = {
  'mont-blanc-hill': {
    hostname: 'montblanchill.casacomleo.com.br',
  },
  reservadosol: {
    hostname: 'reservadosol.casacomleo.com.br',
  },
};

export function getLaunchUrl(slug) {
  const launch = LAUNCHES[slug];
  return launch ? `https://${launch.hostname}` : `/lancamentos/${slug}`;
}

export function getLaunchSlugByHostname(hostname) {
  return Object.entries(LAUNCHES).find(([, launch]) => launch.hostname === hostname)?.[0];
}
