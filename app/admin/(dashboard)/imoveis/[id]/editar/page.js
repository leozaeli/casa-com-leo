import { notFound } from 'next/navigation';
import { getImovelById } from '@/lib/imoveis';
import { listLocalizacoes } from '@/lib/localizacoes';
import ImovelForm from '@/components/admin/ImovelForm';

export default async function EditarImovelPage({ params }) {
  const { id } = await params;
  const [imovel, localizacoes] = await Promise.all([getImovelById(id), listLocalizacoes()]);
  if (!imovel) notFound();

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
    </div>
  );
}
