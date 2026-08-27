import { listImoveisAdmin, coverPhoto, formatPrice } from '@/lib/imoveis';
import DeleteImovelForm from '@/components/admin/DeleteImovelForm';

const SITE_URL = 'https://www.casacomleo.com.br';

export default async function AdminDashboardPage() {
  const imoveis = await listImoveisAdmin();

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Painel</span>
          <h1>Imóveis</h1>
          <p className="admin-page-subtitle">
            {imoveis.length} {imoveis.length === 1 ? 'imóvel cadastrado' : 'imóveis cadastrados'}
          </p>
        </div>
        <a className="button" href="/novo">
          + Novo imóvel
        </a>
      </div>

      {imoveis.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-eyebrow">Catálogo vazio</span>
          <h2>Nenhum imóvel cadastrado ainda.</h2>
          <p>Publique o primeiro imóvel para ele aparecer aqui e no site.</p>
          <a className="button" href="/novo">
            + Novo imóvel
          </a>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Título</th>
                <th>Localização</th>
                <th>Preço</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {imoveis.map((imovel) => (
                <tr key={imovel.id}>
                  <td>
                    <img className="admin-table-thumb" src={coverPhoto(imovel)} alt="" />
                  </td>
                  <td className="admin-table-title">{imovel.titulo}</td>
                  <td>{imovel.localizacao}</td>
                  <td>{formatPrice(imovel.preco)}</td>
                  <td>
                    <span className={`admin-badge ${imovel.destaque ? 'admin-badge-on' : 'admin-badge-off'}`}>
                      <span className="dot"></span>
                      {imovel.destaque ? 'Publicado' : 'Oculto'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <a href={`${SITE_URL}/imoveis/${imovel.slug}`} target="_blank" rel="noreferrer">
                        Ver página
                      </a>
                      <DeleteImovelForm id={imovel.id} slug={imovel.slug} titulo={imovel.titulo} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
