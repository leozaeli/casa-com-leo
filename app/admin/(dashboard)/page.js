import { getVisitStats, getRecentLeads, getLeadStats } from '@/lib/analytics';
import ActiveNow from '@/components/admin/ActiveNow';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [visitStats, leads, leadStats] = await Promise.all([getVisitStats(), getRecentLeads(8), getLeadStats()]);

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Painel</span>
          <h1>Dashboard</h1>
          <p className="admin-page-subtitle">Visão geral do site.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>Visitas hoje</span>
          <strong>{visitStats.today}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Visitas (7 dias)</span>
          <strong>{visitStats.week}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Leads (7 dias)</span>
          <strong>{leadStats.week}</strong>
        </div>
        <ActiveNow />
      </div>

      <div className="admin-dash-grid">
        <div className="admin-panel">
          <h2>Páginas mais visitadas (7 dias)</h2>
          {visitStats.topPages.length === 0 ? (
            <p className="admin-hint">Ainda sem dados suficientes.</p>
          ) : (
            <ul className="admin-top-pages">
              {visitStats.topPages.map((p) => (
                <li key={p.path}>
                  <span>{p.path}</span>
                  <strong>{p.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-panel">
          <h2>Leads recentes</h2>
          {leads.length === 0 ? (
            <p className="admin-hint">Nenhum lead ainda.</p>
          ) : (
            <ul className="admin-leads-list">
              {leads.map((lead) => (
                <li key={lead.id}>
                  <div className="admin-lead-top">
                    <strong>{lead.nome || 'Sem nome'}</strong>
                    <span>{new Date(lead.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  {lead.contato && <span className="admin-lead-contato">{lead.contato}</span>}
                  {lead.mensagem && <p>{lead.mensagem}</p>}
                  <span className="admin-hint">via {lead.origem}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
