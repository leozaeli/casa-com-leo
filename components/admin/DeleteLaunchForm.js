'use client';

import { deleteLaunchBrief } from '@/app/admin/actions';

export default function DeleteLaunchForm({ id, title }) {
  function handleSubmit(event) {
    if (!confirm(`Excluir "${title}"? A página do lançamento deixará de ser publicada.`)) event.preventDefault();
  }

  return <form action={deleteLaunchBrief} onSubmit={handleSubmit}>
    <input type="hidden" name="id" value={id} />
    <button type="submit">Excluir</button>
  </form>;
}
