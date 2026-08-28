import { notFound } from 'next/navigation';
import { getImovelById } from '@/lib/imoveis';
import EditImovelForm from '@/components/admin/EditImovelForm';

export default async function EditarImovelPage({ params }) {
  const { id } = await params;
  const imovel = await getImovelById(id);
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
      <EditImovelForm imovel={imovel} />
    </div>
  );
}
