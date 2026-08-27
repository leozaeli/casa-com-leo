const LINKS = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'imoveis', href: '/imoveis', label: 'Imóveis' },
  { key: 'manifesto', href: '/#manifesto', label: 'Manifesto' },
  { key: 'contato', href: '/contato', label: 'Contato' },
];

export default function Nav({ active }) {
  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-links">
          {LINKS.map((link) => (
            <a key={link.key} className={active === link.key ? 'active' : undefined} href={link.href}>
              {link.label}
            </a>
          ))}
          <a className={`nav-studios${active === 'studios' ? ' active' : ''}`} href="/studios">
            Studios
          </a>
        </div>
        <a className="brand" href="/">
          <span className="brand-mark">L</span> Casa Com Leo
        </a>
        <button className="nav-cta" type="button" data-popup="fale-comigo">
          Fale comigo
        </button>
        <button className="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
