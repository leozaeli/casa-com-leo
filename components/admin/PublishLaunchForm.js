'use client';

import { useState } from 'react';
import { publishLaunch } from '@/app/admin/actions';

export default function PublishLaunchForm({ id, published, url }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);

  async function handlePublish() {
    setPending(true);
    setResult(null);
    const response = await publishLaunch(id);
    setPending(false);
    setResult(response);
  }

  if (published || result?.success) {
    return <a className="button" href={result?.url || url} target="_blank" rel="noreferrer">Ver página</a>;
  }

  return <div className="admin-launch-publish"><button className="button" type="button" disabled={pending} onClick={handlePublish}>{pending ? 'Publicando…' : 'Publicar página'}</button>{result?.error && <span>{result.error}</span>}</div>;
}
