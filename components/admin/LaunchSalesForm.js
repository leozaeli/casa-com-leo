'use client';

import { useState } from 'react';
import { updateLaunchSoldPercentage } from '@/app/admin/actions';

export default function LaunchSalesForm({ propertySlug, percentage = 0 }) {
  const [value, setValue] = useState(percentage);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    await updateLaunchSoldPercentage(propertySlug, value);
    setPending(false);
  }

  return <div className="admin-launch-sales"><label><span>{value === 100 ? '100% vendido' : `${value}% vendido`}</span><input type="range" min="0" max="100" step="1" value={value} onChange={(event) => setValue(Number(event.target.value))} onMouseUp={save} onTouchEnd={save} onKeyUp={(event) => { if (event.key.startsWith('Arrow')) save(); }} /></label><input aria-label="Percentual vendido" type="number" min="0" max="100" value={value} onChange={(event) => setValue(Math.max(0, Math.min(100, Number(event.target.value) || 0)))} onBlur={save} disabled={pending} /></div>;
}
