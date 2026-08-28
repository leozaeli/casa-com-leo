import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import { SimpleFooter } from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import HeroCarousel from '@/components/HeroCarousel';
import MosaicGallery from '@/components/MosaicGallery';
import { getStudioBySlug, formatPrice, formatPriceFull, coverPhoto, TIPOLOGIA_LABEL } from '@/lib/studios';
import { getExchangeRates, formatUSD, formatEUR } from '@/lib/currency';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const studio = await getStudioBySlug(slug);
  if (!studio) return {};
  return {
    title: `${studio.titulo} — Casa com Leo Studios`,
    description: studio.headline,
  };
}

export default async function StudioPage({ params }) {
  const { slug } = await params;
  const studio = await getStudioBySlug(slug);

  if (!studio) notFound();

  const fotos = studio.fotos && studio.fotos.length > 0 ? studio.fotos : [coverPhoto(studio)];
  const rates = await getExchangeRates();
  const precoUsd = studio.preco / rates.usdBrl;
  const precoEur = studio.preco / rates.eurBrl;

  const specs = [
    { value: `${studio.area_m2} m²`, label: 'Área' },
    { value: TIPOLOGIA_LABEL[studio.tipologia] || studio.tipologia, label: 'Tipologia' },
    ...(studio.specs_extra || []),
  ];

  return (
    <div className="property-page">
      <Nav active="studios" />
      <main>
        <section className="detail-hero">
          <HeroCarousel fotos={fotos} />
          <div className="wrap detail-hero-content">
            <span className="eyebrow-tag" style={{ background: 'rgba(255,255,255,.16)', color: '#fff', backdropFilter: 'blur(8px)' }}>
              {studio.eyebrow}
            </span>
            <h1>{studio.titulo}.</h1>
            <div className="detail-meta">
              <span>{studio.localizacao}</span>
              <span>A partir de {formatPriceFull(studio.preco)}</span>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <a className="back-link" href="/studios">
              ← Voltar aos Studios
            </a>
            <div className="detail-intro">
              <h2>{studio.headline}</h2>
              <div>
                <p>{studio.paragrafo_1}</p>
                {studio.paragrafo_2 && <p>{studio.paragrafo_2}</p>}
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
            <MosaicGallery fotos={fotos} alt={studio.titulo} />
          </div>
        </section>
      </main>
      <SimpleFooter />
      <div className="sticky-cta">
        <div className="sticky-cta-inner">
          <div className="sticky-cta-info">
            <strong>{studio.titulo}</strong>
            <span>A partir de {formatPrice(studio.preco)}</span>
          </div>
          <div className="sticky-cta-actions">
            <button
              className="button"
              type="button"
              data-popup="fale-comigo"
              data-prefill={`Tenho interesse na unidade: ${studio.titulo}.`}
            >
              Tenho Interesse
            </button>
          </div>
        </div>
      </div>
      <WhatsAppFloat />
    </div>
  );
}
