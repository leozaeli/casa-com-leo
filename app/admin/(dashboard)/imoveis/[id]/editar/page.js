import { notFound } from 'next/navigation';
import { getImovelById } from '@/lib/imoveis';
import { listLocalizacoes } from '@/lib/localizacoes';
import ImovelForm from '@/components/admin/ImovelForm';
import LaunchSubdomainForm from '@/components/admin/LaunchSubdomainForm';
import { getLaunchBrief } from '@/lib/launch-admin';

export default async function EditarImovelPage({ params }) {
  const { id } = await params;
  const [imovel, localizacoes] = await Promise.all([getImovelById(id), listLocalizacoes()]);
  if (!imovel) notFound();
  const launch = imovel.is_launch ? await getLaunchBrief(imovel.slug) : null;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Edição</span>
          <h1>Editar imóvel</h1>
          <p className="admin-page-subtitle">Atualize as informações de &quot;{imovel.titulo}&quot;.</p>
        </div>
      </div>
      <ImovelForm mode="editar" imovel={imovel} localizacoes={localizacoes} />
      {imovel.is_launch && <LaunchSubdomainForm imovel={imovel} launch={launch} />}
    </div>
  );
}
