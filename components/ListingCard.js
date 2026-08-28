import { BedIcon, AreaIcon } from '@/components/PropertyIcons';
import { formatPrice, coverPhoto } from '@/lib/imoveis';

const MODALITY_LABEL = {
  venda: 'Venda',
  temporada: 'Aluguel por temporada',
  ambos: 'Venda e temporada',
};

export default function ListingCard({ imovel }) {
  const modalidades = imovel.modalidades || ['venda'];
  const modalityKey = modalidades.length > 1 ? 'ambos' : modalidades[0];

  return (
    <a
      className="property-card listing-card"
      data-location={imovel.localizacao_filtro}
      data-category={imovel.categoria}
      data-modality={modalidades.join(' ')}
      data-price={imovel.preco}
      data-bedrooms={imovel.suites}
      data-area={imovel.area_m2}
      href={`/imoveis/${imovel.slug}`}
    >
      <div className="property-image">
        <img src={coverPhoto(imovel)} alt={imovel.titulo} />
        {imovel.vendido ? (
          <div className="property-sold-overlay">
            <span>Vendido</span>
          </div>
        ) : (
          <>
            <span className="property-tag">
              <span className="dot"></span>Disponível
            </span>
            <span className={`modality-tag modality-${modalityKey}`}>{MODALITY_LABEL[modalityKey]}</span>
          </>
        )}
      </div>
      <div className="property-info">
        <div className="property-info-top">
          <h3>{imovel.titulo}</h3>
          <span className="property-price">{formatPrice(imovel.preco)}</span>
        </div>
        <p className="property-location">{imovel.localizacao}</p>
        <div className="property-meta">
          <span>
            <BedIcon />
            {imovel.suites} suítes
          </span>
          <span>
            <AreaIcon />
            {imovel.area_m2} m²
          </span>
        </div>
      </div>
    </a>
  );
}
