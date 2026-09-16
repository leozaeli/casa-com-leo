import { listImoveisAdmin, coverPhoto, formatPrice } from '@/lib/imoveis';
import { getImovelTemperatures } from '@/lib/leads';
import DeleteImovelForm from '@/components/admin/DeleteImovelForm';
import ToggleVendidoForm from '@/components/admin/ToggleVendidoForm';
import InterestThermometer from '@/components/admin/InterestThermometer';
import LaunchSalesForm from '@/components/admin/LaunchSalesForm';
import { listLaunchBriefs } from '@/lib/launch-admin';
import { getLaunchUrl } from '@/lib/launches';

const SITE_URL = 'https://www.casacomleo.com.br';
const CATEGORY_LABEL = { casa: 'Casa', apartamento: 'Apartamento', cobertura: 'Cobertura', terreno: 'Lote' };
const MODALITY_LABEL = { venda: 'Venda', temporada: 'Aluguel' };

export default async function AdminDashboardPage() {
  const [imoveis, temperaturas, launches] = await Promise.all([listImoveisAdmin(), getImovelTemperatures(), listLaunchBriefs()]);
  const launchesByProperty = new Map(launches.filter((launch) => launch.property_slug).map((launch) => [launch.property_slug, launch]));
  const standaloneLaunches = launches.filter((launch) => launch.status === 'published' && !imoveis.some((imovel) => imovel.slug === launch.property_slug));
  const totalItems = imoveis.length + standaloneLaunches.length;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Painel</span>
          <h1>Imóveis</h1>
          <p className="admin-page-subtitle">
            {totalItems} {totalItems === 1 ? 'imóvel cadastrado' : 'imóveis cadastrados'}
          </p>
        </div>
        <a className="button" href="/imoveis/novo">
          + Novo imóvel
        </a>
      </div>

      {totalItems === 0 ? (
        <div className="admin-empty">
          <span className="admin-eyebrow">Catálogo vazio</span>
          <h2>Nenhum imóvel cadastrado ainda.</h2>
          <p>Publique o primeiro imóvel para ele aparecer aqui e no site.</p>
          <a className="button" href="/imoveis/novo">
            + Novo imóvel
          </a>
        </div>
      ) : (
        <div className="admin-table-wrap" tabIndex={0} role="region" aria-label="Lista de imóveis; deslize para ver todas as colunas">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Título</th>
                <th>Localização</th>
                <th>Preço</th>
                <th>Tipo</th>
                <th>Modalidade</th>
                <th>Lançamento</th>
                <th>Status</th>
                <th>Interesse</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {imoveis.map((imovel) => {
                const launch = launchesByProperty.get(imovel.slug);
                return <tr key={imovel.id}>
                  <td className="admin-table-thumb-cell">
                    <img className="admin-table-thumb" src={coverPhoto(imovel)} alt="" />
                  </td>
                  <td className="admin-table-title">{imovel.titulo}</td>
                  <td>{imovel.localizacao}</td>
                  <td>{formatPrice(imovel.preco)}</td>
                  <td>{CATEGORY_LABEL[imovel.categoria] || imovel.categoria || '—'}</td>
                  <td>{(imovel.modalidades || []).map((modality) => MODALITY_LABEL[modality] || modality).join(' + ') || '—'}</td>
                  <td className="admin-launch-cell">{launch ? <><span className="admin-badge admin-badge-on"><span className="dot"></span>Lançamento</span><LaunchSalesForm propertySlug={imovel.slug} percentage={launch.sold_percentage || 0} /></> : '—'}</td>
                  <td>
                    <span className={`admin-badge ${imovel.destaque ? 'admin-badge-on' : 'admin-badge-off'}`}>
                      <span className="dot"></span>
                      {imovel.destaque ? 'Publicado' : 'Oculto'}
                    </span>
                    {imovel.vendido && (
                      <span className="admin-badge admin-badge-off" style={{ marginLeft: '0.4rem' }}>
                        <span className="dot"></span>
                        Vendido
                      </span>
                    )}
                  </td>
                  <td>
                    <InterestThermometer
                      temperatura={temperaturas[imovel.slug]?.temperatura}
                      count={temperaturas[imovel.slug]?.count || 0}
                    />
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <a href={launch ? getLaunchUrl(imovel.slug) : `${SITE_URL}/imoveis/${imovel.slug}`} target="_blank" rel="noreferrer">
                        Ver página
                      </a>
                      <a href={`/imoveis/${imovel.id}/editar`}>Editar</a>
                      <ToggleVendidoForm id={imovel.id} slug={imovel.slug} vendido={imovel.vendido} />
                      <DeleteImovelForm id={imovel.id} slug={imovel.slug} titulo={imovel.titulo} />
                    </div>
                  </td>
                </tr>;
              })}
              {standaloneLaunches.map((launch) => <tr key={launch.id}>
                <td className="admin-table-thumb-cell">
                  <img className="admin-table-thumb" src={launch.subdomain === 'reservadosol' ? 'https://azinunes.com.br/empreendimentos/reserva-do-sol/rds/hero-piscina-fachada.webp' : launch.assets_url || '/brand/logo-4.png'} alt="" />
                </td>
                <td className="admin-table-title">{launch.title}</td>
                <td>{launch.location || '—'}</td>
                <td>Sob consulta</td>
                <td>{launch.property_type || (launch.subdomain === 'reservadosol' ? 'Apartamento' : '—')}</td>
                <td>{launch.modalities?.map((modality) => MODALITY_LABEL[modality] || modality).join(' + ') || 'Venda'}</td>
                <td className="admin-launch-cell"><span className="admin-badge admin-badge-on"><span className="dot"></span>Lançamento</span><LaunchSalesForm propertySlug={launch.id} percentage={launch.sold_percentage || 0} /></td>
                <td><span className="admin-badge admin-badge-on"><span className="dot"></span>Publicado</span></td>
                <td>—</td>
                <td><div className="admin-table-actions"><a href={getLaunchUrl(launch.subdomain)} target="_blank" rel="noreferrer">Ver página</a><a href="/lancamentos">Editar</a></div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
