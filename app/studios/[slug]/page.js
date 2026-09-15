import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import { SimpleFooter } from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import HeroCarousel from '@/components/HeroCarousel';
import MosaicGallery from '@/components/MosaicGallery';
import { getStudioBySlug, formatPrice, formatPriceFull, coverPhoto, TIPOLOGIA_LABEL } from '@/lib/studios';
import { formatSpecItem, specSizeClass } from '@/lib/imoveis';
import { getExchangeRates, formatUSD, formatEUR } from '@/lib/currency';
import '../../home.css';
import '../../identity.css';
import '../../imoveis/[slug]/property.css';

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
    <div className="casa-experience property-page property-experience studio-experience">
      <Nav active="studios" />
      <main>
        <section className="detail-hero">
          <HeroCarousel fotos={fotos} />
          <div className="wrap property-hero-top"><a className="property-back" href="/studios">← Todos os studios</a><span>CASA COM LEO / STUDIOHUB</span></div>
          <div className="wrap detail-hero-content">
              <span className="eyebrow-tag">
              {studio.eyebrow}
            </span>
            <h1>{studio.titulo}</h1>
            <div className="detail-meta">
              <span>{studio.localizacao}</span>
              <span>A partir de {formatPriceFull(studio.preco)}</span>
              <span title="Valor aproximado, convertido pela cotação atual">≈ {formatUSD(precoUsd)}</span>
              <span title="Valor aproximado, convertido pela cotação atual">≈ {formatEUR(precoEur)}</span>
            </div>
            <div className="property-hero-actions"><a className="experience-button" href="#galeria">Explorar {fotos.length} fotos <span>↗</span></a><button className="button" type="button" data-popup="fale-comigo" data-prefill={`Tenho interesse na unidade: ${studio.titulo}.`}>Quero conhecer <span>↗</span></button></div>
          </div>
        </section>

        <div className="property-section-links"><div className="wrap"><a href="#sobre">01 / O studio</a><a href="#galeria">02 / Galeria</a></div></div>
        <section id="sobre" className="property-overview">
          <div className="wrap">
            <span className="eyebrow-tag">01 / UM ESPAÇO PARA O SEU PRÓXIMO CAPÍTULO</span>
            <div className="detail-intro">
              <h2>{studio.headline}</h2>
              <div>
                <p>{studio.paragrafo_1}</p>
                {studio.paragrafo_2 && <p>{studio.paragrafo_2}</p>}
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

        <section className="catalog property-gallery" id="galeria">
          <div className="wrap">
            <div className="section-head"><div><span className="eyebrow-tag">02 / UM OLHAR POR DENTRO</span><h2 className="section-title">Compacto no tamanho.<br /><em>Grande nas possibilidades.</em></h2></div><p className="section-note">Explore os ambientes e os detalhes do seu próximo investimento.</p></div>
            <MosaicGallery fotos={fotos} alt={studio.titulo} refined />
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
      <WhatsAppFloat minimalOnMobile />
    </div>
  );
}
