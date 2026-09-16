'use client';

import { toggleLaunchSold } from '@/app/admin/actions';

export default function ToggleLaunchSoldForm({ id, sold }) {
  return <form action={toggleLaunchSold}>
    <input type="hidden" name="id" value={id} />
    <input type="hidden" name="sold" value={(!sold).toString()} />
    <button type="submit">{sold ? 'Marcar disponível' : 'Marcar vendido'}</button>
  </form>;
}
