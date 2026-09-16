import { BedIcon, AreaIcon } from '@/components/PropertyIcons';
import { formatPrice, coverPhoto } from '@/lib/imoveis';
import ListingGallery from '@/components/ListingGallery';

const MODALITY_LABEL = {
  venda: 'Venda',
  temporada: 'Aluguel por temporada',
  ambos: 'Venda e temporada',
};

export default function ListingCard({ imovel, carousel = false }) {
  const modalidades = imovel.modalidades || ['venda'];
  const modalityKey = modalidades.length > 1 ? 'ambos' : modalidades[0];
  const isLaunch = imovel.slug === 'mont-blanc-hill';
  const href = isLaunch ? `/lancamentos/${imovel.slug}` : `/imoveis/${imovel.slug}`;
  const photos = imovel.fotos?.length ? imovel.fotos : [coverPhoto(imovel)];

  return (
    <article
      className="property-card listing-card"
      data-location={imovel.localizacao_filtro}
      data-category={imovel.categoria}
      data-modality={modalidades.join(' ')}
      data-price={imovel.preco}
      data-bedrooms={imovel.suites}
      data-area={imovel.area_m2}
    >
      <div className="property-image">
        {carousel ? <ListingGallery photos={photos} title={imovel.titulo} href={href} /> : <img src={photos[0]} alt={imovel.titulo} />}
        {isLaunch && <span className="property-launch-label">Lançamento</span>}
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
      <a className="listing-card-link" href={href} aria-label={`Ver imóvel ${imovel.titulo}`}>
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
    </article>
  );
}
