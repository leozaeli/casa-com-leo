const LOCATIONS = [
  'Salvador',
  'Lauro de Freitas',
  'Abrantes',
  'Litoral Norte',
  'Guarajuba',
  'Itacimirim',
  'Praia do Forte',
  'Imbassaí',
  'Barra do Jacuípe',
];

export default function Footer() {
  const items = [...LOCATIONS, ...LOCATIONS];
  return (
    <footer>
      <div className="wrap footer-inner">
        <span>© 2026 Casa Com Leo</span>
        <a className="footer-instagram" href="https://www.instagram.com/casacomleo/" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
          <span>@casacomleo</span>
        </a>
        <img className="footer-brand-accent" src="/brand/logo-4.png" alt="" aria-hidden="true" />
        <div className="locations-marquee">
          <div className="locations-track">
            {items.map((location, index) => (
              <span key={`${location}-${index}`}>{location}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SimpleFooter() {
  return (
    <footer>
      <div className="wrap footer-inner">
        <span>© 2026 Casa Com Leo</span>
        <a className="footer-instagram" href="https://www.instagram.com/casacomleo/" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
          <span>@casacomleo</span>
        </a>
        <img className="footer-brand-accent" src="/brand/logo-4.png" alt="" aria-hidden="true" />
      </div>
    </footer>
  );
}
