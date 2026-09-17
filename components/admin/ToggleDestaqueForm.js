'use client';

import { toggleDestaque } from '@/app/admin/actions';

export default function ToggleDestaqueForm({ id, slug, destaque, itemType = 'imovel' }) {
  return (
    <form action={toggleDestaque} className="admin-highlight-toggle">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="item_type" value={itemType} />
      <label>
        <input type="checkbox" name="destaque" defaultChecked={destaque} onChange={(event) => event.currentTarget.form?.requestSubmit()} />
        <span>{destaque ? 'Em destaque' : 'Marcar'}</span>
      </label>
    </form>
  );
}
