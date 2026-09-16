/* eslint-disable @next/next/no-html-link-for-pages -- Full page navigation initializes the existing public/script.js handlers. */
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import { SimpleFooter } from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import HeroCarousel from '@/components/HeroCarousel';
import MosaicGallery from '@/components/MosaicGallery';
import ExperienceIcon from '@/components/ExperienceIcon';
import HomeMotion from '@/components/HomeMotion';
import '../../home.css';
import './property.css';
import {
  getImovelBySlug,
  formatPrice,
  formatPriceFull,
  coverPhoto,
  buildImovelSpecs,
  formatSpecItem,
  specSizeClass,
  resolveMapEmbed,
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
  const temPreco = Number(imovel.preco) > 0;
  const rates = temPreco ? await getExchangeRates() : null;
  const precoUsd = temPreco ? imovel.preco / rates.usdBrl : null;
  const precoEur = temPreco ? imovel.preco / rates.eurBrl : null;

  const specs = buildImovelSpecs(imovel);
  const mapEmbed = await resolveMapEmbed(imovel.mapa_url);

  return (
    <div className="casa-experience property-page property-experience">
      <HomeMotion />
      <Nav active="imoveis" />
      <main>
        <section className="detail-hero">
          <HeroCarousel fotos={fotos} />
          <div className="wrap property-hero-top">
            <a className="property-back" href="/imoveis"><ExperienceIcon direction="left" /> Todos os imóveis</a>
            <span>CASA COM LEO / A SELEÇÃO</span>
          </div>
          <div className="wrap detail-hero-content">
            <span className="eyebrow-tag">
              {imovel.eyebrow}
            </span>
            {imovel.vendido && <span className="property-tag property-tag-vendido detail-vendido-tag">Vendido</span>}
            <h1>{imovel.titulo}</h1>
            <div className="detail-meta">
              <span>{imovel.localizacao}</span>
              <span className="property-hero-price">{formatPriceFull(imovel.preco)}</span>
              {temPreco && <span title="Valor aproximado, convertido pela cotação atual">≈ {formatUSD(precoUsd)}</span>}
              {temPreco && <span title="Valor aproximado, convertido pela cotação atual">≈ {formatEUR(precoEur)}</span>}
              {modalidades.map((modalidade) => (
                <span key={modalidade}>{MODALITY_LABEL[modalidade] || modalidade}</span>
              ))}
            </div>
            <div className="property-hero-actions">
              <a className="experience-button" href="#galeria">Explorar {fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'} <ExperienceIcon /></a>
              {!imovel.vendido && <button className="button" type="button" data-popup="interesse" data-property={imovel.titulo} data-modalities={modalidades.join(' ')}>Quero conhecer <ExperienceIcon /></button>}
            </div>
          </div>
        </section>

        <div className="property-section-links"><div className="wrap"><a href="#sobre">01 / O imóvel</a><a href="#galeria">02 / Galeria</a>{mapEmbed && <a href="#localizacao">03 / Localização</a>}</div></div>
        <section className="property-overview" id="sobre">
          <div className="wrap">
            <span className="eyebrow-tag">01 / UM LUGAR PARA O SEU PRÓXIMO CAPÍTULO</span>
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

        <section className="catalog property-gallery" id="galeria">
          <div className="wrap">
            <div className="section-head"><div><span className="eyebrow-tag">02 / UM OLHAR POR DENTRO</span><h2 className="section-title">Cada detalhe.<br /><em>Um novo olhar.</em></h2></div><p className="section-note">Explore os ambientes. Toque nas fotos para ver em tela cheia.</p></div>
            <MosaicGallery fotos={fotos} alt={imovel.titulo} refined />
          </div>
        </section>

        {mapEmbed && (
          <section className="location-section" id="localizacao">
            <div className="wrap location-grid">
              <div className="location-info">
                <span className="eyebrow-tag">03 / O ENTORNO TAMBÉM IMPORTA</span>
                <h2 className="section-title">Seu lugar<br /><em>na Bahia.</em></h2>
                <p>{imovel.localizacao}</p>
                {imovel.entorno_texto && <p className="location-surroundings">{imovel.entorno_texto}</p>}
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
        <section className="property-invitation">
          <div className="wrap">
            <div><span className="eyebrow-tag">O PRÓXIMO PASSO É SEU</span><h2 className="section-title">{imovel.vendido ? 'Seu próximo lugar espera.' : 'Se imagine aqui.'}</h2><p>{imovel.vendido ? 'Este imóvel já encontrou seu próximo capítulo. Conheça outras possibilidades.' : 'Converse comigo sobre os detalhes e as possibilidades deste imóvel.'}</p></div>
            {imovel.vendido ? <a className="button" href="/imoveis">Explorar outros imóveis <ExperienceIcon /></a> : <button className="button" type="button" data-popup="interesse" data-property={imovel.titulo} data-modalities={modalidades.join(' ')}>Vamos conversar <ExperienceIcon /></button>}
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
                Tenho interesse <ExperienceIcon />
              </button>
            )}
          </div>
        </div>
      </div>
      <WhatsAppFloat minimalOnMobile />
    </div>
  );
}
