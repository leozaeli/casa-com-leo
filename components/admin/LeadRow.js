'use client';

import { useRef, useState, useTransition } from 'react';
import { updateLead, deleteLead } from '@/app/admin/actions';
import { STATUS_OPTIONS, INTENCAO_OPTIONS, CANAL_LABEL, TEMPERATURA_LABEL } from '@/lib/crm-constants';

export default function LeadRow({ lead }) {
  const formRef = useRef(null);
  const [notas, setNotas] = useState(lead.notas || '');
  const [isPending, startTransition] = useTransition();

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
