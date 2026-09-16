import LaunchForm from '@/components/admin/LaunchForm';
import { listLaunchBriefs } from '@/lib/launch-admin';
import PublishLaunchForm from '@/components/admin/PublishLaunchForm';
import LaunchBriefActions from '@/components/admin/LaunchBriefActions';

export default async function LancamentosAdminPage() {
  const launches = await listLaunchBriefs();
  return (
    <div>
      <div className="admin-page-head"><div><span className="admin-eyebrow">Lançamentos</span><h1>Criar página de lançamento</h1><p className="admin-page-subtitle">Envie uma referência ou os dados do empreendimento. Cada lançamento ganha uma página própria no seu subdomínio.</p></div></div>
      <LaunchForm />
      <section className="admin-form-section admin-launch-list"><h2>Páginas de lançamento</h2>{launches.length === 0 ? <p className="admin-hint">Nenhuma página de lançamento em preparação.</p> : <div className="admin-launch-briefs">{launches.map((launch) => <article key={launch.id}><div><span>{launch.source_mode === 'reference' ? 'Referência' : 'Manual'}</span><h3>{launch.title}</h3><p>{launch.subdomain}.casacomleo.com.br</p><LaunchBriefActions launch={launch} /></div><div className="admin-launch-actions"><b>{launch.status === 'published' ? 'Publicado' : 'Em preparação'}</b><PublishLaunchForm id={launch.id} published={launch.status === 'published'} url={`https://${launch.subdomain}.casacomleo.com.br`} /></div></article>)}</div>}</section>
    </div>
  );
}
