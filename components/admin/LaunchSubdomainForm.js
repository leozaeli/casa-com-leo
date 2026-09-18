'use client';

import { useMemo, useRef, useState } from 'react';
import { importAndPublishPropertyLaunchPage, publishPropertyLaunchPage } from '@/app/admin/actions';

function toSubdomain(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 63);
}

export default function LaunchSubdomainForm({ imovel, launch }) {
  const initialSubdomain = launch?.subdomain || toSubdomain(imovel.titulo);
  const [subdomain, setSubdomain] = useState(initialSubdomain);
  const [referenceUrl, setReferenceUrl] = useState(launch?.reference_url || imovel.reference_url || '');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const formRef = useRef(null);
  const url = useMemo(() => (subdomain ? 'https://' + subdomain + '.casacomleo.com.br' : ''), [subdomain]);

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    const response = await publishPropertyLaunchPage(new FormData(event.currentTarget));
    setPending(false);
    setResult(response);
  }

  async function handleImport() {
    setPending(true);
    setResult(null);
    const response = await importAndPublishPropertyLaunchPage(new FormData(formRef.current));
    setPending(false);
    setResult(response);
  }

  return (
    <section className="admin-form-section admin-subdomain-section">
      <h2>Página especial do lançamento</h2>
      <p className="admin-hint">Envie a referência para extrair textos, dados, seções e imagens disponíveis na página de origem e publicar a experiência completa no subdomínio.</p>
      <form className="admin-form admin-subdomain-form" onSubmit={handleSubmit} ref={formRef}>
        <input type="hidden" name="property_id" value={imovel.id} />
        <div className="admin-form-row">
          <label>
            Subdomínio
            <input name="subdomain" required value={subdomain} onChange={(event) => setSubdomain(toSubdomain(event.target.value))} placeholder="montblanchill" />
            <span className="admin-hint">Sem espaços, acentos ou hífens.</span>
          </label>
          <label>
            Link de referência
            <input name="reference_url" type="url" value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} placeholder="https://..." />
            <span className="admin-hint">Opcional: fica salvo junto à página especial.</span>
          </label>
        </div>
        {url && <p className="admin-launch-url">{url}</p>}
        {result?.error && <p className="admin-form-error">{result.error}</p>}
        {result?.success && <p className="admin-form-success">Página publicada. <a href={result.url} target="_blank" rel="noreferrer">Abrir subdomínio →</a></p>}
        <div className="admin-submit-row">
          <button className="button" type="button" disabled={pending || !referenceUrl.trim()} onClick={handleImport}>
            {pending ? 'Importando e publicando…' : 'Importar referência e publicar página completa'}
          </button>
          <button className="button" type="submit" disabled={pending}>
            {launch?.status === 'published' ? 'Publicar sem nova importação' : 'Publicar com dados do imóvel'}
          </button>
          {launch?.status === 'published' && (
            <a className="admin-secondary-button" href={'https://' + launch.subdomain + '.casacomleo.com.br'} target="_blank" rel="noreferrer">Ver página</a>
          )}
        </div>
      </form>
    </section>
  );
}
