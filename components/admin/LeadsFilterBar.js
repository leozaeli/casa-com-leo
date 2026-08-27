'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { STATUS_OPTIONS, INTENCAO_OPTIONS } from '@/lib/crm-constants';

export default function LeadsFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/leads?${params.toString()}`);
  }

  return (
    <div className="admin-leads-filters">
      <select defaultValue={searchParams.get('status') || ''} onChange={(e) => updateParam('status', e.target.value)}>
        <option value="">Todas as etapas</option>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select defaultValue={searchParams.get('intencao') || ''} onChange={(e) => updateParam('intencao', e.target.value)}>
        <option value="">Compra e aluguel</option>
        {INTENCAO_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select defaultValue={searchParams.get('canal') || ''} onChange={(e) => updateParam('canal', e.target.value)}>
        <option value="">Todos os canais</option>
        <option value="formulario">Formulário</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="lista_espera">Lista de espera</option>
      </select>
      <input
        type="search"
        placeholder="Buscar por nome, contato ou mensagem..."
        defaultValue={searchParams.get('q') || ''}
        onKeyDown={(e) => {
          if (e.key === 'Enter') updateParam('q', e.currentTarget.value);
        }}
      />
    </div>
  );
}
