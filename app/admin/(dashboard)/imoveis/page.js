import { listImoveisAdmin, coverPhoto, formatPrice } from '@/lib/imoveis';
import { getImovelTemperatures } from '@/lib/leads';
import DeleteImovelForm from '@/components/admin/DeleteImovelForm';
import ToggleVendidoForm from '@/components/admin/ToggleVendidoForm';
import ToggleDestaqueForm from '@/components/admin/ToggleDestaqueForm';
import InterestThermometer from '@/components/admin/InterestThermometer';

const SITE_URL = 'https://www.casacomleo.com.br';
const CATEGORY_LABEL = { casa: 'Casa', apartamento: 'Apartamento', cobertura: 'Cobertura', terreno: 'Lote' };
const MODALITY_LABEL = { venda: 'Venda', temporada: 'Aluguel' };

export default async function AdminDashboardPage() {
  const [imoveis, temperaturas] = await Promise.all([listImoveisAdmin(), getImovelTemperatures()]);

  return (
    <div>
      <div className="admin-page-head">
        <div><span className="admin-eyebrow">Painel</span><h1>Imóveis</h1><p className="admin-page-subtitle">{imoveis.length} {imoveis.length === 1 ? 'imóvel cadastrado' : 'imóveis cadastrados'}</p></div>
        <a className="button" href="/imoveis/novo">+ Novo imóvel</a>
      </div>
      {imoveis.length === 0 ? (
        <div className="admin-empty"><span className="admin-eyebrow">Catálogo vazio</span><h2>Nenhum imóvel cadastrado ainda.</h2><p>Publique o primeiro imóvel para ele aparecer aqui e no site.</p><a className="button" href="/imoveis/novo">+ Novo imóvel</a></div>
      ) : (
        <div className="admin-table-wrap" tabIndex={0} role="region" aria-label="Lista de imóveis; deslize para ver todas as colunas">
          <table className="admin-table">
            <thead><tr><th></th><th>Título</th><th>Localização</th><th>Preço</th><th>Tipo</th><th>Modalidade</th><th>Lançamento</th><th>Status</th><th>Destaque</th><th>Interesse</th><th></th></tr></thead>
            <tbody>
              {imoveis.map((imovel) => <tr key={imovel.id}>
                <td className="admin-table-thumb-cell"><img className="admin-table-thumb" src={coverPhoto(imovel)} alt="" /></td>
                <td className="admin-table-title">{imovel.titulo}</td><td>{imovel.localizacao}</td><td>{formatPrice(imovel.preco)}</td><td>{CATEGORY_LABEL[imovel.categoria] || imovel.categoria || '—'}</td>
                <td>{(imovel.modalidades || []).map((modality) => MODALITY_LABEL[modality] || modality).join(' + ') || '—'}</td>
                <td>{imovel.is_launch ? <span className="admin-badge admin-badge-on"><span className="dot"></span>Lançamento</span> : '—'}</td>
                <td><span className={`admin-badge ${imovel.destaque ? 'admin-badge-on' : 'admin-badge-off'}`}><span className="dot"></span>{imovel.destaque ? 'Destaque' : 'No catálogo'}</span>{imovel.vendido && <span className="admin-badge admin-badge-off" style={{ marginLeft: '0.4rem' }}><span className="dot"></span>Vendido</span>}</td>
                <td><ToggleDestaqueForm id={imovel.id} slug={imovel.slug} destaque={imovel.destaque} /></td>
                <td><InterestThermometer temperatura={temperaturas[imovel.slug]?.temperatura} count={temperaturas[imovel.slug]?.count || 0} /></td>
                <td><div className="admin-table-actions"><a href={`${SITE_URL}/imoveis/${imovel.slug}`} target="_blank" rel="noreferrer">Ver página</a><a href={`/imoveis/${imovel.id}/editar`}>Editar</a><ToggleVendidoForm id={imovel.id} slug={imovel.slug} vendido={imovel.vendido} /><DeleteImovelForm id={imovel.id} slug={imovel.slug} titulo={imovel.titulo} /></div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
