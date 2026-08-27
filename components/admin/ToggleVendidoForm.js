'use client';

import { toggleVendido } from '@/app/admin/actions';

export default function ToggleVendidoForm({ id, slug, vendido }) {
  return (
    <form action={toggleVendido}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="vendido" value={(!vendido).toString()} />
      <button type="submit">{vendido ? 'Marcar disponível' : 'Marcar vendido'}</button>
    </form>
  );
}
