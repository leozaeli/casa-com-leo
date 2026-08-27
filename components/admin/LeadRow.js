'use client';

import { useRef, useState, useTransition } from 'react';
import { updateLead, deleteLead } from '@/app/admin/actions';
import { STATUS_OPTIONS, INTENCAO_OPTIONS, CANAL_LABEL, TEMPERATURA_LABEL } from '@/lib/crm-constants';

function buildWhatsAppLink(contato, nome) {
  if (!contato || contato.includes('@')) return null;
  const digits = contato.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  const greeting = `Olá${nome ? `, ${nome}` : ''}! Aqui é o Leo, da Casa com Leo.`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(greeting)}`;
}

export default function LeadRow({ lead }) {
  const formRef = useRef(null);
  const [notas, setNotas] = useState(lead.notas || '');
  const [isPending, startTransition] = useTransition();

  const whatsappLink = buildWhatsAppLink(lead.contato, lead.nome);

  function submitForm() {
    if (!formRef.current) return;
    startTransition(() => {
      updateLead(new FormData(formRef.current));
    });
  }

  function handleDelete() {
    if (!confirm(`Excluir o lead de "${lead.nome}"? Essa ação não pode ser desfeita.`)) return;
    const fd = new FormData();
    fd.set('id', lead.id);
    startTransition(() => {
      deleteLead(fd);
    });
  }

  return (
    <form ref={formRef} className="admin-lead-row">
      <input type="hidden" name="id" value={lead.id} />

      <div className="admin-lead-row-top">
        <div className="admin-lead-row-id">
          <strong>{lead.nome || 'Sem nome'}</strong>
          <span className={`admin-temp-dot admin-temp-${lead.temperatura}`}>{TEMPERATURA_LABEL[lead.temperatura]}</span>
        </div>
        <span className="admin-hint">{new Date(lead.created_at).toLocaleString('pt-BR')}</span>
      </div>

      {lead.contato && <div className="admin-lead-contato">{lead.contato}</div>}
      {lead.mensagem && <p className="admin-lead-msg">{lead.mensagem}</p>}
      <span className="admin-hint">
        {CANAL_LABEL[lead.canal] || lead.canal} · via {lead.origem}
      </span>

      {whatsappLink && (
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="admin-lead-whatsapp">
          <svg viewBox="0 0 32 32" fill="none">
            <path
              fill="currentColor"
              d="M16.001 3C9.1 3 3.5 8.6 3.5 15.5c0 2.4.67 4.65 1.83 6.57L3 29l7.1-2.3a12.4 12.4 0 0 0 5.9 1.5h.01c6.9 0 12.5-5.6 12.5-12.5S22.9 3 16 3zm0 22.7h-.01a10.2 10.2 0 0 1-5.2-1.43l-.37-.22-3.86 1.25 1.27-3.76-.24-.39a10.17 10.17 0 0 1-1.56-5.42c0-5.64 4.59-10.23 10.24-10.23 2.74 0 5.31 1.07 7.24 3 1.93 1.93 3 4.5 3 7.24 0 5.65-4.6 10.24-10.24 10.24zm5.6-7.66c-.31-.15-1.82-.9-2.1-1-.28-.1-.49-.15-.69.15-.2.3-.79 1-.97 1.2-.18.2-.36.23-.67.08-.31-.15-1.3-.48-2.48-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.47.13-.62.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.08-.15-.69-1.67-.95-2.28-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.82-.74 2.08-1.46.26-.72.26-1.33.18-1.46-.08-.13-.28-.2-.59-.36z"
            />
          </svg>
          Falar no WhatsApp
        </a>
      )}

      <div className="admin-lead-row-fields">
        <label>
          Etapa do funil
          <select name="status" defaultValue={lead.status} onChange={submitForm}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Intenção
          <select name="intencao" defaultValue={lead.intencao} onChange={submitForm}>
            {INTENCAO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="admin-lead-notas">
        Notas
        <textarea
          name="notas"
          value={notas}
          onChange={(event) => setNotas(event.target.value)}
          onBlur={submitForm}
          placeholder="Anotações sobre esse lead..."
        ></textarea>
      </label>

      <div className="admin-lead-row-actions">
        {isPending && <span className="admin-hint">Salvando…</span>}
        <button type="button" className="admin-lead-delete" onClick={handleDelete}>
          Excluir lead
        </button>
      </div>
    </form>
  );
}
