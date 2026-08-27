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
        <a href="/contato">Agendar uma visita →</a>
      </div>
    </footer>
  );
}
