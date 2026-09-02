import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ListingCard from '@/components/ListingCard';
import { listImoveis } from '@/lib/imoveis';
import { listLocalizacoes } from '@/lib/localizacoes';

export const revalidate = 0;

export default async function HomePage() {
  const [todosImoveis, localizacoes] = await Promise.all([listImoveis(), listLocalizacoes()]);
  const imoveis = todosImoveis.slice(0, 3);
  const cidades = localizacoes.map((loc) => ({
    ...loc,
    total: todosImoveis.filter((im) => im.localizacao_filtro === loc.slug).length,
  }));

  return (
    <>
      <Nav active="home" />
      <main>
        <section className="hero-cover" id="inicio">
          <div className="hero-cover-media">
            <img
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=85"
              alt="Sala de estar ampla em uma casa contemporânea"
            />
            <div className="hero-cover-scrim"></div>
          </div>
          <div className="wrap hero-cover-inner">
            <span className="pill-badge" style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }}>
              <span className="dot"></span>Salvador · Litoral Norte Baiano
            </span>
            <h1>
              Um caminho claro até o seu próximo <span className="rotating-word" id="rotating-word">endereço</span>.
            </h1>
            <p className="hero-copy" style={{ color: 'rgba(255,255,255,.82)' }}>
              Veja imóveis selecionados e encontre o que realmente faz sentido para a sua próxima casa.
            </p>
          </div>
          <div className="wrap hero-search-wrap">
            <form className="hero-search" action="/imoveis" method="get">
              <label>
                Localização
                <select name="localizacao" defaultValue="todos">
                  <option value="todos">Todas</option>
                  {localizacoes.map((loc) => (
                    <option key={loc.slug} value={loc.slug}>
                      {loc.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo de imóvel
                <select name="tipo" defaultValue="todos">
                  <option value="todos">Todos</option>
                  <option value="casa">Casa</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="cobertura">Cobertura</option>
                  <option value="terreno">Terreno</option>
                </select>
              </label>
              <label>
                Faixa de valor
                <select name="preco" defaultValue="todos">
                  <option value="todos">Qualquer valor</option>
                  <option value="ate-7">Até R$ 7 mi</option>
                  <option value="7-10">R$ 7 a 10 mi</option>
                  <option value="acima-10">Acima de R$ 10 mi</option>
                </select>
              </label>
              <button className="button" type="submit">
                Buscar →
              </button>
            </form>
          </div>
        </section>

        <section className="catalog catalog-with-hero-search" id="catalogo">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow-tag">🏠 Imóveis</span>
                <h2 className="section-title">Últimos imóveis selecionados.</h2>
              </div>
              <p className="section-note">
                Cada endereço tem um ritmo, uma luz, uma história. Encontre o espaço que conversa com a sua.
              </p>
            </div>
            <div className="filter-row">
              <button className="filter active" data-filter="todos">
                Todos
              </button>
              <button className="filter" data-filter="casa">
                Casas
              </button>
              <button className="filter" data-filter="apartamento">
                Apartamentos
              </button>
              <button className="filter" data-filter="cobertura">
                Coberturas
              </button>
              <button className="filter" data-filter="terreno">
                Terrenos
              </button>
              <a className="filter" href="/studios">
                Studios
              </a>
            </div>
            {imoveis.length > 0 ? (
              <div className="property-grid">
                {imoveis.map((imovel) => (
                  <ListingCard key={imovel.id} imovel={imovel} />
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <p>Novidades a caminho. Fale comigo para saber mais sobre os próximos imóveis.</p>
              </div>
            )}
          </div>
        </section>

        <section className="benefits">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow-tag">✓ Diferenciais</span>
                <h2 className="section-title">Por que buscar seu imóvel com a Casa com Leo.</h2>
              </div>
              <p className="section-note">
                Curadoria sem ruído, atenção aos detalhes e acompanhamento próximo do início ao fim.
              </p>
            </div>
            <div className="benefits-grid">
              <div className="benefit-cards">
                <div className="benefit-card">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" />
                    <path d="M9.5 12l1.8 1.8L15 10" />
                  </svg>
                  <h3>Curadoria sem ruído</h3>
                  <p>Só entram no catálogo imóveis que valem a sua visita.</p>
                </div>
                <div className="benefit-card">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 21V9l8-5 8 5v12" />
                    <path d="M9 21v-6h6v6M4 21h16" />
                  </svg>
                  <h3>Atenção aos detalhes</h3>
                  <p>Luz, proporção e bairro avaliados antes de te indicar.</p>
                </div>
                <div className="benefit-card">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h4l3 8 4-16 3 8h4" />
                  </svg>
                  <h3>Processo transparente</h3>
                  <p>Sem letras miúdas — você sabe de cada etapa da negociação.</p>
                </div>
                <div className="benefit-card">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="3.4" />
                    <path d="M5 21c1.5-4 4-6 7-6s5.5 2 7 6" />
                  </svg>
                  <h3>Acompanhamento próximo</h3>
                  <p>Do primeiro contato à chave na mão, sempre por perto.</p>
                </div>
              </div>
              <div className="benefits-image">
                <img
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85"
                  alt="Cozinha contemporânea com acabamento natural"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="format-banner">
          <div className="wrap">
            <div className="format-banner-card">
              <img
                className="format-banner-image"
                src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=85"
                alt="Ambiente elegante com vista"
              />
              <div className="format-banner-overlay"></div>
              <div className="format-banner-content">
                <div>
                  <span className="eyebrow-tag" style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }}>
                    ✦ Como posso ajudar
                  </span>
                  <h2 className="section-title">Escolha o seu formato.</h2>
                  <p>Comprar, vender ou alugar por temporada — sempre com a mesma atenção aos detalhes.</p>
                </div>
                <div className="format-options">
                  <a className="format-option" href="/imoveis?finalidade=venda">
                    Comprar <span>→</span>
                  </a>
                  <a className="format-option" href="/contato">
                    Vender <span>→</span>
                  </a>
                  <a className="format-option" href="/imoveis?finalidade=temporada">
                    Alugar por temporada <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {cidades.length > 0 && (
          <section className="cities">
            <div className="wrap">
              <div className="section-head">
                <div>
                  <span className="eyebrow-tag">📍 Onde buscar</span>
                  <h2 className="section-title">Localizações Selecionadas.</h2>
                </div>
                <p className="section-note">Escolha uma região e veja os imóveis selecionados por lá.</p>
              </div>
              <div className="cities-grid">
                {cidades.map((cidade) => (
                  <a key={cidade.slug} className="city-chip" href={`/imoveis?localizacao=${cidade.slug}`}>
                    <span>{cidade.nome}</span>
                    <span className="city-chip-count">{cidade.total}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="statement" id="manifesto">
          <div className="wrap">
            <span className="eyebrow-tag" style={{ background: 'rgba(255,255,255,.08)', color: 'var(--accent)' }}>
              O jeito Casa com Leo
            </span>
            <h2 className="section-title">Menos busca. Mais encontro.</h2>
            <p className="statement-copy">
              A gente acredita que o imóvel certo não precisa de exageros. Precisa de luz boa, proporções honestas e um
              bairro que faça sentido para a sua vida.
            </p>
            <a className="statement-link" href="/contato">
              Vamos encontrar o seu →
            </a>
            <div className="manifesto">
              <div>
                <strong>01</strong>
                <span>Curadoria sem ruído</span>
              </div>
              <div>
                <strong>02</strong>
                <span>Olhar para os detalhes</span>
              </div>
              <div>
                <strong>03</strong>
                <span>Processo transparente</span>
              </div>
              <div>
                <strong>04</strong>
                <span>Acompanhamento próximo</span>
              </div>
            </div>
          </div>
        </section>

        <section className="contact" id="contato">
          <div className="wrap contact-grid">
            <div>
              <span className="eyebrow-tag">✉ Seu próximo endereço</span>
              <h2 className="section-title">Vamos conversar sobre sua casa?</h2>
            </div>
            <form className="contact-form" id="contact-form">
              <label htmlFor="nome">Seu nome</label>
              <input id="nome" name="nome" required placeholder="Como posso te chamar?" />
              <label htmlFor="email">Seu e-mail</label>
              <input id="email" name="email" type="email" required placeholder="voce@email.com" />
              <label htmlFor="mensagem">O que você procura?</label>
              <textarea id="mensagem" name="mensagem" required placeholder="Conte um pouco sobre o seu próximo endereço."></textarea>
              <button className="button" type="submit">
                Enviar mensagem
              </button>
              <p className="success">Obrigado. Em breve entro em contato com você.</p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
