import { AreaIcon } from '@/components/PropertyIcons';
import { formatPrice, coverPhoto, TIPOLOGIA_LABEL } from '@/lib/studios';

export default function StudioCard({ studio }) {
  return (
    <a className="property-card listing-card" href={`/studios/${studio.slug}`}>
      <div className="property-image">
        <img src={coverPhoto(studio)} alt={studio.titulo} />
        <span className="property-tag">
          <span className="dot"></span>Disponível
        </span>
      </div>
      <div className="property-info">
        <div className="property-info-top">
          <h3>{studio.titulo}</h3>
          <span className="property-price">A partir de {formatPrice(studio.preco)}</span>
        </div>
        <p className="property-location">{studio.localizacao}</p>
        <div className="property-meta">
          <span>{TIPOLOGIA_LABEL[studio.tipologia] || studio.tipologia}</span>
          <span>
            <AreaIcon />
            {studio.area_m2} m²
          </span>
        </div>
      </div>
    </a>
  );
}
