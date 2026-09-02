import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import { SimpleFooter } from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import HeroCarousel from '@/components/HeroCarousel';
import MosaicGallery from '@/components/MosaicGallery';
import {
  getImovelBySlug,
  formatPrice,
  formatPriceFull,
  coverPhoto,
  buildImovelSpecs,
  formatSpecItem,
  specSizeClass,
  resolveMapEmbed,
  getNearbyHighlights,
} from '@/lib/imoveis';
import { getExchangeRates, formatUSD, formatEUR } from '@/lib/currency';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const imovel = await getImovelBySlug(slug);
  if (!imovel) return {};
  return {
    title: `${imovel.titulo} — Casa com Leo`,
    description: imovel.headline,
  };
}

const MODALITY_LABEL = { venda: 'Venda', temporada: 'Aluguel por temporada' };

export default async function ImovelPage({ params }) {
  const { slug } = await params;
  const imovel = await getImovelBySlug(slug);

  if (!imovel) notFound();

  const modalidades = imovel.modalidades && imovel.modalidades.length > 0 ? imovel.modalidades : ['venda'];
  const fotos = imovel.fotos && imovel.fotos.length > 0 ? imovel.fotos : [coverPhoto(imovel)];
  const rates = await getExchangeRates();
  const precoUsd = imovel.preco / rates.usdBrl;
  const precoEur = imovel.preco / rates.eurBrl;

  const specs = buildImovelSpecs(imovel);
  const mapEmbed = await resolveMapEmbed(imovel.mapa_url);
  const nearbyHighlights = mapEmbed ? await getNearbyHighlights(mapEmbed.lat, mapEmbed.lon) : [];

  return (
    <div className="property-page">
      <Nav />
      <main>
        <section className="detail-hero">
          <HeroCarousel fotos={fotos} />
          <div className="wrap detail-hero-content">
            <span className="eyebrow-tag" style={{ background: 'rgba(255,255,255,.16)', color: '#fff', backdropFilter: 'blur(8px)' }}>
              {imovel.eyebrow}
            </span>
            {imovel.vendido && <span className="property-tag property-tag-vendido detail-vendido-tag">Vendido</span>}
            <h1>{imovel.titulo}.</h1>
            <div className="detail-meta">
              <span>{imovel.localizacao}</span>
              <span>{formatPriceFull(imovel.preco)}</span>
              <span title="Valor aproximado, convertido pela cotação atual">≈ {formatUSD(precoUsd)}</span>
              <span title="Valor aproximado, convertido pela cotação atual">≈ {formatEUR(precoEur)}</span>
              {modalidades.map((modalidade) => (
                <span key={modalidade}>{MODALITY_LABEL[modalidade] || modalidade}</span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <a className="back-link" href="/imoveis">
              ← Voltar ao catálogo
            </a>
            <div className="detail-intro">
              <h2>{imovel.headline}</h2>
              <div>
                <p>{imovel.paragrafo_1}</p>
                {imovel.paragrafo_2 && <p>{imovel.paragrafo_2}</p>}
              </div>
            </div>
            <div className="specs">
              {specs.map((spec, index) => {
                const item = formatSpecItem(spec);
                if (!item) return null;
                return (
                  <div className={`spec ${specSizeClass(item)}`.trim()} key={index}>
                    <strong>{item.title}</strong>
                    {item.subtitle && <span>{item.subtitle}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="catalog">
          <div className="wrap">
            <span className="eyebrow-tag">Um olhar por dentro</span>
            <MosaicGallery fotos={fotos} alt={imovel.titulo} />
          </div>
        </section>

        {mapEmbed && (
          <section className="location-section">
            <div className="wrap location-grid">
              <div className="location-info">
                <span className="location-eyebrow">Localização</span>
                <h2>Onde fica.</h2>
                <p>{imovel.localizacao}</p>
                {nearbyHighlights.length > 0 && (
                  <div className="location-tags">
                    {nearbyHighlights.map((tag) => (
                      <span className="location-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="location-map">
                <iframe
                  src={mapEmbed.embedSrc}
                  title={`Mapa de localização — ${imovel.titulo}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>
        )}
      </main>
      <SimpleFooter />
      <div className="sticky-cta">
        <div className="sticky-cta-inner">
          <div className="sticky-cta-info">
            <strong>{imovel.titulo}</strong>
            <span>{formatPrice(imovel.preco)}</span>
          </div>
          <div className="sticky-cta-actions">
            {imovel.vendido ? (
              <span className="button" style={{ opacity: 0.6, cursor: 'default' }}>
                Imóvel vendido
              </span>
            ) : (
              <button
                className="button"
                type="button"
                data-popup="interesse"
                data-property={imovel.titulo}
                data-modalities={modalidades.join(' ')}
              >
                Tenho Interesse
              </button>
            )}
          </div>
        </div>
      </div>
      <WhatsAppFloat />
    </div>
  );
}
