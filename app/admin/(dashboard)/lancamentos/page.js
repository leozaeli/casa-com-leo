import ImovelForm from '@/components/admin/ImovelForm';
import { listLocalizacoes } from '@/lib/localizacoes';
import { listImoveisAdmin } from '@/lib/imoveis';

export default async function LancamentosAdminPage() {
  const [localizacoes, imoveis] = await Promise.all([listLocalizacoes(), listImoveisAdmin()]);
  const launches = imoveis.filter((imovel) => imovel.is_launch);

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Lançamentos</span>
          <h1>Novo lançamento</h1>
          <p className="admin-page-subtitle">O lançamento também é um imóvel: ao publicar, entra no catálogo, na home e na página de lançamentos.</p>
        </div>
      </div>
      <ImovelForm mode="novo" launchMode localizacoes={localizacoes} />
      {launches.length > 0 && (
        <section className="admin-launch-list">
          <span className="admin-eyebrow">Já publicados</span>
          <div className="admin-launch-briefs">
            {launches.map((launch) => <article key={launch.id}><div><span>Lançamento</span><h3>{launch.titulo}</h3><p>{launch.localizacao}</p></div><a className="admin-secondary-button" href={'/imoveis/' + launch.id + '/editar'}>Editar</a></article>)}
          </div>
        </section>
      )}
    </div>
  );
}
