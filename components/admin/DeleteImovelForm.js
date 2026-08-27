'use client';

import { deleteImovel } from '@/app/admin/actions';

export default function DeleteImovelForm({ id, slug, titulo }) {
  function handleSubmit(event) {
    if (!confirm(`Excluir "${titulo}"? Essa ação não pode ser desfeita.`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteImovel} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <button type="submit">Excluir</button>
    </form>
  );
}
