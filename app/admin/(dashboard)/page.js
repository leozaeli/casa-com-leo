import { listImoveisAdmin, coverPhoto, formatPrice } from '@/lib/imoveis';
import DeleteImovelForm from '@/components/admin/DeleteImovelForm';

export default async function AdminDashboardPage() {
  const imoveis = await listImoveisAdmin();

  return (
    <div>
      <div className="admin-page-head">
        <h1>Imóveis</h1>
        <a className="button" href="/admin/novo">
          + Novo imóvel
        </a>
      </div>

      {imoveis.length === 0 ? (
        <div className="admin-empty">Nenhum imóvel cadastrado ainda.</div>
      ) : (
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
                <td>{imovel.titulo}</td>
                <td>{imovel.localizacao}</td>
                <td>{formatPrice(imovel.preco)}</td>
                <td>{imovel.destaque ? 'Publicado' : 'Oculto'}</td>
                <td>
                  <div className="admin-table-actions">
                    <a href={`/imoveis/${imovel.slug}`} target="_blank" rel="noreferrer">
                      Ver página
                    </a>
                    <DeleteImovelForm id={imovel.id} slug={imovel.slug} titulo={imovel.titulo} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
