import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import { SimpleFooter } from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import HeroCarousel from '@/components/HeroCarousel';
import MosaicGallery from '@/components/MosaicGallery';
import { getImovelBySlug, formatPrice, formatPriceFull, coverPhoto } from '@/lib/imoveis';
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

  const specs = [
    { value: `${imovel.area_m2} m²`, label: imovel.area_label },
    { value: String(imovel.suites), label: 'Suítes' },
    { value: String(imovel.vagas), label: 'Vagas' },
    ...(imovel.specs_extra || []),
  ];

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
              {specs.map((spec, index) => (
                <div className="spec" key={index}>
                  <strong>{spec.value}</strong>
                  <span>{spec.label}</span>
                </div>
              ))}
            </div>
            <div className="price-conversions">
              <span>
                ≈ {formatUSD(precoUsd)} <em>(valor aproximado)</em>
              </span>
              <span>
                ≈ {formatEUR(precoEur)} <em>(valor aproximado)</em>
              </span>
            </div>
          </div>
        </section>

        <section className="catalog">
          <div className="wrap">
            <span className="eyebrow-tag">Um olhar por dentro</span>
            <MosaicGallery fotos={fotos} alt={imovel.titulo} />
          </div>
        </section>
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
