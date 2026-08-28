'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLocalizacao } from '@/app/admin/actions';

export default function NovaLocalizacaoForm() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = await createLocalizacao(null, formData);
    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-section">
        <h2>Adicionar localização</h2>
        <label>
          Nome
          <input name="nome" required placeholder="Ex: Praia do Forte" />
          <span className="admin-hint">Fica salva e passa a aparecer no cadastro de imóveis e nos filtros do site.</span>
        </label>
        {error && <p className="admin-form-error">{error}</p>}
        <div className="admin-submit-row">
          <button className="button" type="submit" disabled={pending}>
            {pending ? 'Salvando…' : 'Adicionar localização'}
          </button>
        </div>
      </div>
    </form>
  );
}
