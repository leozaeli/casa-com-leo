import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ListingCard from '@/components/ListingCard';
import { listImoveis } from '@/lib/imoveis';

export const metadata = {
  title: 'Ver imóveis — Casa com Leo',
  description: 'Imóveis selecionados entre Salvador e o Litoral Norte Baiano.',
};

export const revalidate = 0;

export default async function ImoveisPage() {
  const imoveis = await listImoveis();

  return (
    <>
      <Nav active="imoveis" />
      <main>
        <section className="listing-intro">
          <div className="wrap">
            <a className="back-link" href="/">
              ← Voltar para a home
            </a>
            <span className="eyebrow-tag">🏠 Curadoria Casa com Leo · Bahia</span>
            <div className="listing-heading">
              <h1>Encontre o seu lugar.</h1>
              <p>
                Explore uma seleção de imóveis entre Salvador e o Litoral Norte Baiano. Filtre por localização, tipo,
                valor e tamanho até encontrar o que casa com você.
              </p>
            </div>
          </div>
        </section>

        <section className="listing-catalog">
          <div className="wrap">
            <div className="filter-panel" aria-label="Filtros de imóveis">
              <div className="filter-panel-top">
                <div>
                  <span className="eyebrow-tag">Refine sua busca</span>
                  <h2>Do seu jeito.</h2>
                </div>
                <div className="filter-panel-actions">
                  <a className="filter" href="/studios">
                    Studios
                  </a>
                  <button className="clear-filters" type="button" id="clear-filters">
                    Limpar filtros
                  </button>
                </div>
              </div>
              <div className="filter-fields">
                <label>
                  Localização
                  <select id="location-filter">
                    <option value="todos">Todas as localizações</option>
                    <option value="salvador">Salvador</option>
                    <option value="praia-do-forte">Praia do Forte</option>
                    <option value="itacimirim">Itacimirim</option>
                    <option value="guarajuba">Guarajuba</option>
                  </select>
                </label>
                <label>
                  Tipo de imóvel
                  <select id="type-filter">
                    <option value="todos">Todos os tipos</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="cobertura">Cobertura</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </label>
                <label>
                  Finalidade
                  <select id="modality-filter">
                    <option value="todos">Venda e temporada</option>
                    <option value="venda">Venda</option>
                    <option value="temporada">Aluguel por temporada</option>
                  </select>
                </label>
                <label>
                  Faixa de valor
                  <select id="price-filter">
                    <option value="todos">Qualquer valor</option>
                    <option value="ate-7">Até R$ 7 milhões</option>
                    <option value="7-10">R$ 7 a 10 milhões</option>
                    <option value="acima-10">Acima de R$ 10 milhões</option>
                  </select>
                </label>
                <label>
                  Suítes
                  <select id="bedroom-filter">
                    <option value="todos">Qualquer quantidade</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6 ou mais</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="results-bar">
              <p>
                <strong id="results-count">
                  {imoveis.length} {imoveis.length === 1 ? 'imóvel' : 'imóveis'}
                </strong>{' '}
                encontrados
              </p>
              <label className="sort-field">
                Ordenar por
                <select id="sort-filter">
                  <option value="featured">Destaques</option>
                  <option value="price-asc">Menor valor</option>
                  <option value="price-desc">Maior valor</option>
                  <option value="area-desc">Maior área</option>
                </select>
              </label>
            </div>
            <div className="property-grid listing-grid" id="property-results">
              {imoveis.map((imovel) => (
                <ListingCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
            <div className="empty-results" id="empty-results" hidden={imoveis.length > 0}>
              <span className="eyebrow-tag">Nenhum encontro ainda</span>
              <h2>Vamos ampliar a busca?</h2>
              <p>
                Não encontramos imóveis com esses filtros. Tente outra combinação ou fale comigo para uma curadoria
                personalizada.
              </p>
              <button className="button" type="button" id="empty-clear">
                Limpar filtros
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
