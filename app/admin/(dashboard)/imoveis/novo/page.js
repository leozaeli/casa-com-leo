import ImovelForm from '@/components/admin/ImovelForm';
import { listLocalizacoes } from '@/lib/localizacoes';

export default async function NovoImovelPage() {
  const localizacoes = await listLocalizacoes();

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Cadastro</span>
          <h1>Novo imóvel</h1>
          <p className="admin-page-subtitle">
            Preencha os dados abaixo — a página do imóvel é criada automaticamente ao publicar.
          </p>
        </div>
      </div>
      <ImovelForm mode="novo" localizacoes={localizacoes} />
    </div>
  );
}
