'use client';

import { useMemo, useState } from 'react';
import { createLaunchBrief } from '@/app/admin/actions';

function slugify(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function LaunchForm() {
  const [mode, setMode] = useState('reference');
  const [title, setTitle] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const generatedSubdomain = useMemo(() => slugify(title).replaceAll('-', ''), [title]);
  const activeSubdomain = subdomain || generatedSubdomain;

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    const response = await createLaunchBrief(new FormData(event.currentTarget));
    setPending(false);
    setResult(response);
    if (response?.success) {
      event.currentTarget.reset();
      setTitle('');
      setSubdomain('');
      setMode('reference');
    }
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="admin-form-section">
        <h2>Como a página será construída?</h2>
        <div className="admin-choice-cards" role="radiogroup" aria-label="Modo de cadastro">
          <label className={mode === 'reference' ? 'admin-choice-card active' : 'admin-choice-card'}>
            <input type="radio" name="source_mode" value="reference" checked={mode === 'reference'} onChange={() => setMode('reference')} />
            <b>Enviar referência</b>
            <span>Envie uma página de referência para construirmos a experiência do empreendimento.</span>
          </label>
          <label className={mode === 'manual' ? 'admin-choice-card active' : 'admin-choice-card'}>
            <input type="radio" name="source_mode" value="manual" checked={mode === 'manual'} onChange={() => setMode('manual')} />
            <b>Preencher dados</b>
            <span>Informe os dados, textos e imagens para criar a página do zero.</span>
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Identidade e endereço</h2>
        <div className="admin-form-row">
          <label>Nome do empreendimento<input name="title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Mont Blanc Hill" /></label>
          <label>Subdomínio<input name="subdomain" value={subdomain} onChange={(event) => setSubdomain(slugify(event.target.value).replaceAll('-', ''))} placeholder={generatedSubdomain || 'montblanchill'} /><span className="admin-hint">Sem espaços, acentos ou hífens.</span></label>
        </div>
        <p className="admin-launch-url">{activeSubdomain ? `https://${activeSubdomain}.casacomleo.com.br` : 'O endereço será gerado a partir do nome.'}</p>
      </div>

      {mode === 'reference' ? (
        <div className="admin-form-section">
          <h2>Referência</h2>
          <label>URL da página de referência<input name="reference_url" type="url" required placeholder="https://..." /></label>
          <label>O que devemos aproveitar?<textarea name="reference_notes" placeholder="Ex.: ritmo da página, paleta, tipo de galeria, tom dos textos e elementos que não devem ser copiados." /></label>
        </div>
      ) : (
        <div className="admin-form-section">
          <h2>Briefing do lançamento</h2>
          <div className="admin-form-row"><label>Localização<input name="location" required placeholder="Caminho das Árvores · Salvador" /></label><label>Incorporadora / construtora<input name="developer" placeholder="Ex.: Azinunes / BETA" /></label></div>
          <label>Apresentação<textarea name="description" required placeholder="Conte a essência do empreendimento, diferenciais e momento da obra." /></label>
          <label>Dados principais<input name="highlights" placeholder="Ex.: 133,81 m² · 3 suítes · 2 vagas · nascente" /></label>
          <label>Link ou pasta com imagens<input name="assets_url" type="url" placeholder="https://drive.google.com/..." /></label>
        </div>
      )}

      {result?.error && <p className="admin-form-error">{result.error}</p>}
      {result?.success && <p className="admin-form-success">Dados recebidos. A página será publicada em <strong>{result.url}</strong>.</p>}
      <div className="admin-submit-row"><button className="button" type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Criar lançamento'}</button></div>
    </form>
  );
}
