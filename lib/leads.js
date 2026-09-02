import { createAdminClient } from '@/lib/supabase/server';

const CANAL_WEIGHT = { whatsapp: 25, lista_espera: 20, formulario: 15 };

export function computeTemperature(lead, repeatCount) {
  if (lead.status === 'fechado_ganho' || lead.status === 'fechado_perdido') {
    return 'fechado';
  }

  const daysSince = Math.max(0, (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
  let score = Math.max(0, 40 - daysSince * 4);
  score += CANAL_WEIGHT[lead.canal] || 15;
  score += Math.min(30, Math.max(0, (repeatCount - 1) * 20));
  if (lead.mensagem && lead.mensagem.includes('imóvel:')) score += 10;
  if (lead.status && lead.status !== 'novo') score += 15;

  if (score >= 60) return 'quente';
  if (score >= 30) return 'morno';
  return 'frio';
}

function buildRepeatCounts(leads) {
  const counts = {};
  leads.forEach((lead) => {
    const key = (lead.contato || '').trim().toLowerCase();
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

export async function listLeadsAdmin({ status, canal, intencao, q } = {}) {
  const admin = createAdminClient();
  let query = admin.from('leads').select('*').order('created_at', { ascending: false }).limit(300);

  if (status) query = query.eq('status', status);
  if (canal) query = query.eq('canal', canal);
  if (intencao) query = query.eq('intencao', intencao);

  const { data, error } = await query;
  if (error) {
    console.error('Erro ao listar leads:', error);
    return [];
  }

  let leads = data || [];
  const repeatCounts = buildRepeatCounts(leads);

  if (q) {
    const needle = q.toLowerCase();
    leads = leads.filter(
      (lead) =>
        (lead.nome || '').toLowerCase().includes(needle) ||
        (lead.contato || '').toLowerCase().includes(needle) ||
        (lead.mensagem || '').toLowerCase().includes(needle)
    );
  }

  return leads.map((lead) => ({
    ...lead,
    temperatura: computeTemperature(lead, repeatCounts[(lead.contato || '').trim().toLowerCase()] || 1),
  }));
}

export async function getLeadFunnelCounts() {
  const admin = createAdminClient();
  const { data } = await admin.from('leads').select('status').limit(5000);

  const counts = {};
  (data || []).forEach((row) => {
    const status = row.status || 'novo';
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
}

const TEMP_RANK = { fechado: 0, frio: 1, morno: 2, quente: 3 };

export async function getImovelTemperatures() {
  const admin = createAdminClient();
  const { data } = await admin.from('leads').select('origem, created_at, canal, status, mensagem, contato').limit(5000);
  const leads = data || [];
  const repeatCounts = buildRepeatCounts(leads);

  const bySlug = {};
  leads.forEach((lead) => {
    const match = (lead.origem || '').match(/\/imoveis\/([^/?#]+)/);
    if (!match) return;
    const slug = match[1];
    const temp = computeTemperature(lead, repeatCounts[(lead.contato || '').trim().toLowerCase()] || 1);
    if (!bySlug[slug]) bySlug[slug] = { temperatura: temp, count: 0 };
    bySlug[slug].count += 1;
    if (TEMP_RANK[temp] > TEMP_RANK[bySlug[slug].temperatura]) bySlug[slug].temperatura = temp;
  });

  return bySlug;
}

export async function getTemperatureCounts() {
  const admin = createAdminClient();
  const { data } = await admin.from('leads').select('created_at, canal, status, mensagem, contato').limit(5000);
  const leads = data || [];
  const repeatCounts = buildRepeatCounts(leads);

  const counts = { quente: 0, morno: 0, frio: 0, fechado: 0 };
  leads.forEach((lead) => {
    const temp = computeTemperature(lead, repeatCounts[(lead.contato || '').trim().toLowerCase()] || 1);
    counts[temp] += 1;
  });
  return counts;
}
