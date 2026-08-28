import { listLocalizacoes } from '@/lib/localizacoes';
import NovaLocalizacaoForm from '@/components/admin/NovaLocalizacaoForm';

export default async function LocalizacoesPage() {
  const localizacoes = await listLocalizacoes();

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Imóveis</span>
          <h1>Localizações</h1>
          <p className="admin-page-subtitle">
            Localizações disponíveis para os imóveis. Tudo que você adicionar aqui fica salvo e passa a aparecer no
            cadastro/edição de imóveis e nos filtros do site.
          </p>
        </div>
      </div>

      <NovaLocalizacaoForm />

      {localizacoes.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody>
              {localizacoes.map((loc) => (
                <tr key={loc.slug}>
                  <td className="admin-table-title">{loc.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
