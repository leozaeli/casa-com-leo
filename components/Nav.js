const LINKS = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'imoveis', href: '/imoveis', label: 'Imóveis' },
  { key: 'lancamentos', href: '/lancamentos', label: 'Lançamentos' },
  { key: 'manifesto', href: '/#manifesto', label: 'Manifesto' },
  { key: 'contato', href: '/contato', label: 'Contato' },
];

export default function Nav({ active, launchOnly = false }) {
  return (
    <nav>
      <div className="nav-inner">
        {!launchOnly && <div className="nav-links">
          {LINKS.map((link) => (
            <a key={link.key} className={active === link.key ? 'active' : undefined} href={link.href}>
              {link.label}
            </a>
          ))}
          <a className={`nav-studios${active === 'studios' ? ' active' : ''}`} href="/studios">
            Studios
          </a>
        </div>}
        <a className="brand" href="/">
          <span className="brand-logo-frame"><img className="brand-logo" src="/brand/logo-1.png" alt="Casa com Leo" /></span>
        </a>
        <button className="nav-cta" type="button" data-popup="fale-comigo">
          Fale comigo
        </button>
        {!launchOnly && <button className="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>}
      </div>
    </nav>
  );
}
