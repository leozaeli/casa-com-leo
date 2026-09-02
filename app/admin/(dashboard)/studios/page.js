import { listStudiosAdmin, coverPhoto, formatPrice } from '@/lib/studios';
import DeleteStudioForm from '@/components/admin/DeleteStudioForm';

const SITE_URL = 'https://www.casacomleo.com.br';

export default async function AdminStudiosPage() {
  const studios = await listStudiosAdmin();

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Painel</span>
          <h1>Studios</h1>
          <p className="admin-page-subtitle">
            {studios.length} {studios.length === 1 ? 'unidade cadastrada' : 'unidades cadastradas'}
          </p>
        </div>
        <a className="button" href="/studios/novo">
          + Novo studio
        </a>
      </div>

      {studios.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-eyebrow">Catálogo vazio</span>
          <h2>Nenhuma unidade cadastrada ainda.</h2>
          <p>Publique a primeira unidade para ela aparecer aqui e em /studios.</p>
          <a className="button" href="/studios/novo">
            + Novo studio
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
              {studios.map((studio) => (
                <tr key={studio.id}>
                  <td className="admin-table-thumb-cell">
                    <img className="admin-table-thumb" src={coverPhoto(studio)} alt="" />
                  </td>
                  <td className="admin-table-title">{studio.titulo}</td>
                  <td>{studio.localizacao}</td>
                  <td>{formatPrice(studio.preco)}</td>
                  <td>
                    <span className={`admin-badge ${studio.destaque ? 'admin-badge-on' : 'admin-badge-off'}`}>
                      <span className="dot"></span>
                      {studio.destaque ? 'Publicado' : 'Oculto'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <a href={`${SITE_URL}/studios/${studio.slug}`} target="_blank" rel="noreferrer">
                        Ver página
                      </a>
                      <DeleteStudioForm id={studio.id} slug={studio.slug} titulo={studio.titulo} />
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
