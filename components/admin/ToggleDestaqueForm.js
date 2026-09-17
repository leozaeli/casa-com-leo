'use client';

import { toggleDestaque } from '@/app/admin/actions';

export default function ToggleDestaqueForm({ id, slug, destaque }) {
  return (
    <form action={toggleDestaque} className="admin-highlight-toggle">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <label>
        <input type="checkbox" name="destaque" defaultChecked={destaque} onChange={(event) => event.currentTarget.form?.requestSubmit()} />
        <span>{destaque ? 'Em destaque' : 'Marcar'}</span>
      </label>
    </form>
  );
}
