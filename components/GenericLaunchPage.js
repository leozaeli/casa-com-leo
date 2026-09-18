import Nav from '@/components/Nav';
import { SimpleFooter } from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function GenericLaunchPage({ launch, property }) {
  const content = launch.page_content || {};
  const photos = [...new Set([...(launch.source_images || []), ...(property?.fotos || [])])];
  const description = content.summary || launch.description || 'Um novo endereço pensado para viver com mais intenção.';
  const stats = content.stats || [];
  const sections = content.sections || [];
  const facts = content.facts || [];

  return (
    <div className="launch-page site-identity">
      <Nav active="lancamentos" launchOnly />
      <main>
        <section className="launch-hero">
          <img src={photos[0] || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85'} alt="" />
          <div className="launch-hero-shade" />
          <div className="wrap launch-hero-content">
            <span className="launch-label">Lançamento</span>
            <h1>{content.title || launch.title}</h1>
            <p>{content.hero || description}</p>
            <div className="launch-hero-actions">
              <a className="experience-button" href="#sobre">Conhecer o projeto</a>
              <button className="button" type="button" data-popup="interesse" data-property={launch.title} data-modalities="venda">Quero conhecer</button>
            </div>
          </div>
        </section>

        <section className="launch-intro" id="sobre">
          <div className="wrap">
            <span className="launch-kicker">O EMPREENDIMENTO</span>
            <div className="launch-intro-grid">
              <h2>Informações<br /><em>do projeto.</em></h2>
              <p>{description}</p>
            </div>
            {stats.length > 0 && <div className="launch-numbers">{stats.map((stat) => <div key={stat.label + stat.value}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>}
          </div>
        </section>

        {sections.map((section, index) => (
          <section className={'launch-story ' + (index % 2 ? 'launch-story-reverse' : '')} key={section.title + index}>
            <div className="wrap launch-story-grid">
              <div className="launch-story-copy"><span className="launch-kicker">{String(index + 1).padStart(2, '0')} / EM DETALHE</span><h2>{section.title}</h2><p>{section.text}</p></div>
              {photos[(index + 1) % photos.length] && <figure className="launch-story-image"><img src={photos[(index + 1) % photos.length]} alt={section.title} /></figure>}
            </div>
          </section>
        ))}

        {photos.length > 1 && (
          <section className="launch-gallery">
            <div className="wrap">
              <div className="launch-section-heading"><span className="launch-kicker">GALERIA</span><h2>Perspectivas<br /><em>do projeto.</em></h2></div>
              <div className="launch-leisure-images">{photos.slice(0, 9).map((photo) => <figure key={photo}><img src={photo} alt={launch.title} /></figure>)}</div>
            </div>
          </section>
        )}

        {facts.length > 0 && (
          <section className="launch-technical">
            <div className="wrap">
              <span className="launch-kicker">FICHA TÉCNICA</span>
              <div className="launch-tech-grid">{facts.map((fact) => <div key={fact.label + fact.value}><span>{fact.label}</span><p>{fact.value}</p></div>)}</div>
            </div>
          </section>
        )}

        <section className="launch-cta"><div className="wrap"><div><span>{launch.location || 'CASA COM LEO / LANÇAMENTOS'}</span><h2>Vamos conversar<br />sobre esse começo?</h2></div><button className="button" type="button" data-popup="interesse" data-property={launch.title} data-modalities="venda">Quero saber mais</button></div></section>
      </main>
      <SimpleFooter />
      <WhatsAppFloat minimalOnMobile />
    </div>
  );
}
