import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export const metadata = {
  title: 'Studios — Casa com Leo',
  description: 'Casa com Leo Studios — um novo projeto a caminho.',
};

export default function StudiosPage() {
  return (
    <>
      <Nav active="studios" />
      <main>
        <section className="studios-hero">
          <div className="wrap">
            <span className="pill-badge">
              <span className="dot"></span> Novo projeto a caminho
            </span>
            <h1>StudioHUB - Seu investimento ideal está aqui.</h1>
            <p>
              Estamos preparando um novo jeito de viver, com a mesma curadoria que você já conhece. Em breve, mais
              detalhes por aqui.
            </p>
            <button className="button" type="button" data-popup="fale-comigo">
              Quero ser avisado
            </button>
          </div>
        </section>

        <section className="catalog">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow-tag">✦ Tipologias</span>
                <h2 className="section-title">Duas formas de investir.</h2>
              </div>
              <p className="section-note">
                Ainda estamos fechando os últimos detalhes — mas já dá pra saber qual formato faz mais sentido pra você.
              </p>
            </div>
            <div className="services-grid services-grid-2">
              <div className="service-card">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85"
                  alt="Studio com ambiente único e integrado"
                />
                <div className="service-card-copy">
                  <h3>Studio</h3>
                  <p>Unidades compactas e funcionais, pensadas para alta liquidez de locação.</p>
                </div>
              </div>
              <div className="service-card">
                <img
                  src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=85"
                  alt="Apartamento com quarto e sala separados"
                />
                <div className="service-card-copy">
                  <h3>Quarto e Sala</h3>
                  <p>Mais espaço para morar ou alugar, com a mesma curadoria de sempre.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
