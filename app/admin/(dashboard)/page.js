import {
  getVisitStats,
  getVisitTrend,
  getTopReferrers,
  getTopLocalities,
  getRecentLeads,
  getLeadStats,
} from '@/lib/analytics';
import { getLeadFunnelCounts, getTemperatureCounts } from '@/lib/leads';
import { STATUS_OPTIONS, CANAL_LABEL, TEMPERATURA_LABEL } from '@/lib/crm-constants';
import ActiveNow from '@/components/admin/ActiveNow';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [visitStats, trend, referrers, localities, leads, leadStats, funnelCounts, tempCounts] = await Promise.all([
    getVisitStats(),
    getVisitTrend(14),
    getTopReferrers(),
    getTopLocalities(),
    getRecentLeads(5),
    getLeadStats(),
    getLeadFunnelCounts(),
    getTemperatureCounts(),
  ]);

  const maxTrend = Math.max(1, ...trend.map((d) => d.count));
  const canalEntries = Object.entries(leadStats.byCanal);
  const openFunnel = STATUS_OPTIONS.filter((o) => !o.value.startsWith('fechado'));

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

      <div className="admin-panel admin-panel-wide">
        <h2>Visitas nos últimos 14 dias</h2>
        <div className="admin-trend-chart">
          {trend.map((day) => (
            <div className="admin-trend-bar-wrap" key={day.date} title={`${day.date}: ${day.count}`}>
              <div className="admin-trend-bar" style={{ height: `${Math.max(4, (day.count / maxTrend) * 100)}%` }}></div>
              <span>{day.date.slice(8, 10)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel admin-panel-wide">
        <div className="admin-panel-head-row">
          <h2>Funil de leads</h2>
          <a href="/leads" className="admin-panel-link">
            Ver CRM completo →
          </a>
        </div>
        <div className="admin-funnel-strip">
          {openFunnel.map((opt) => (
            <div className="admin-funnel-step" key={opt.value}>
              <strong>{funnelCounts[opt.value] || 0}</strong>
              <span>{opt.label}</span>
            </div>
          ))}
          <div className="admin-funnel-step admin-funnel-step-won">
            <strong>{funnelCounts.fechado_ganho || 0}</strong>
            <span>Fechado (ganho)</span>
          </div>
          <div className="admin-funnel-step admin-funnel-step-lost">
            <strong>{funnelCounts.fechado_perdido || 0}</strong>
            <span>Fechado (perdido)</span>
          </div>
        </div>
        <div className="admin-temp-strip">
          <span className="admin-temp-pill admin-temp-quente">🔥 {tempCounts.quente} quentes</span>
          <span className="admin-temp-pill admin-temp-morno">🌤 {tempCounts.morno} mornos</span>
          <span className="admin-temp-pill admin-temp-frio">❄️ {tempCounts.frio} frios</span>
        </div>
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
          <h2>Imóveis e Studios mais vistos (7 dias)</h2>
          {visitStats.topProperties.length === 0 ? (
            <p className="admin-hint">Ainda sem dados suficientes.</p>
          ) : (
            <ul className="admin-top-pages">
              {visitStats.topProperties.map((p) => (
                <li key={p.path}>
                  <span>{p.path}</span>
                  <strong>{p.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-panel">
          <h2>Origem do tráfego (7 dias)</h2>
          {referrers.length === 0 ? (
            <p className="admin-hint">Ainda sem dados suficientes.</p>
          ) : (
            <ul className="admin-top-pages">
              {referrers.map((r) => (
                <li key={r.source}>
                  <span>{r.source}</span>
                  <strong>{r.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-panel">
          <h2>Localidades (7 dias)</h2>
          {localities.length === 0 ? (
            <p className="admin-hint">Ainda sem dados suficientes.</p>
          ) : (
            <ul className="admin-top-pages">
              {localities.map((l) => (
                <li key={l.place}>
                  <span>{l.place}</span>
                  <strong>{l.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head-row">
            <h2>Leads recentes</h2>
            <a href="/leads" className="admin-panel-link">
              Ver todos →
            </a>
          </div>
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
                  <span className={`admin-badge admin-badge-canal-${lead.canal || 'formulario'}`}>
                    {CANAL_LABEL[lead.canal] || 'Formulário'}
                  </span>
                  {lead.contato && <span className="admin-lead-contato">{lead.contato}</span>}
                  {lead.mensagem && <p>{lead.mensagem}</p>}
                  <span className="admin-hint">via {lead.origem}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-panel">
          <h2>Leads por canal (7 dias)</h2>
          {canalEntries.length === 0 ? (
            <p className="admin-hint">Nenhum lead ainda.</p>
          ) : (
            <ul className="admin-top-pages">
              {canalEntries.map(([canal, count]) => (
                <li key={canal}>
                  <span>{CANAL_LABEL[canal] || canal}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
