import { listLeadsAdmin, getLeadFunnelCounts } from '@/lib/leads';
import { STATUS_OPTIONS } from '@/lib/crm-constants';
import LeadsFilterBar from '@/components/admin/LeadsFilterBar';
import LeadRow from '@/components/admin/LeadRow';

export const revalidate = 0;

export default async function AdminLeadsPage({ searchParams }) {
  const sp = await searchParams;
  const status = sp.status || undefined;
  const canal = sp.canal || undefined;
  const intencao = sp.intencao || undefined;
  const q = sp.q || undefined;

  const [leads, funnelCounts] = await Promise.all([
    listLeadsAdmin({ status, canal, intencao, q }),
    getLeadFunnelCounts(),
  ]);

  const totalLeads = Object.values(funnelCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">CRM</span>
          <h1>Leads</h1>
          <p className="admin-page-subtitle">{totalLeads} leads no total · acompanhe o funil de compra e aluguel.</p>
        </div>
      </div>

      <div className="admin-funnel-strip">
        {STATUS_OPTIONS.map((opt) => (
          <div className="admin-funnel-step" key={opt.value}>
            <strong>{funnelCounts[opt.value] || 0}</strong>
            <span>{opt.label}</span>
          </div>
        ))}
      </div>

      <LeadsFilterBar />

      {leads.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-eyebrow">Nenhum resultado</span>
          <h2>Nenhum lead encontrado.</h2>
          <p>Ajuste os filtros ou aguarde novos contatos chegarem pelo site.</p>
        </div>
      ) : (
        <div className="admin-lead-grid">
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
