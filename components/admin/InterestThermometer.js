const LABELS = {
  quente: 'Quente',
  morno: 'Morno',
  frio: 'Frio',
  fechado: 'Fechado',
};

export default function InterestThermometer({ temperatura, count = 0 }) {
  const level = temperatura || (count > 0 ? 'frio' : null);
  const label = level ? LABELS[level] || level : 'Sem interesse ainda';

  return (
    <div className="admin-thermo-wrap" title={count > 0 ? `${count} ${count === 1 ? 'lead' : 'leads'} · ${label}` : label}>
      <div className={`admin-thermo${level ? ` admin-thermo-${level}` : ''}`}>
        <span className="admin-thermo-seg" />
        <span className="admin-thermo-seg" />
        <span className="admin-thermo-seg" />
      </div>
      <span className="admin-thermo-label">{count > 0 ? `${label} · ${count}` : label}</span>
    </div>
  );
}
