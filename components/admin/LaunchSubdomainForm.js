'use client';

import { useMemo, useRef, useState } from 'react';
import { importAndPublishPropertyLaunchPage, publishPropertyLaunchPage, savePropertyLaunchPageContent } from '@/app/admin/actions';

function toSubdomain(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '').slice(0, 63);
}

function emptyContent() {
  return { title: '', hero: '', summary: '', stats: [], sections: [], facts: [] };
}

export default function LaunchSubdomainForm({ imovel, launch }) {
  const [subdomain, setSubdomain] = useState(launch?.subdomain || toSubdomain(imovel.titulo));
  const [referenceUrl, setReferenceUrl] = useState(launch?.reference_url || imovel.reference_url || '');
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [pageContent, setPageContent] = useState(launch?.page_content || null);
  const [saveMessage, setSaveMessage] = useState(null);
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
    setSaveMessage(null);
    setProgress({ percent: 8, label: 'Lendo a página de referência…' });
    const stages = [
      window.setTimeout(() => setProgress({ percent: 34, label: 'Interpretando o empreendimento e seus diferenciais…' }), 900),
      window.setTimeout(() => setProgress({ percent: 62, label: 'Coletando dados, números e ficha técnica…' }), 2200),
      window.setTimeout(() => setProgress({ percent: 84, label: 'Organizando a página e a galeria…' }), 4200),
    ];
    const response = await importAndPublishPropertyLaunchPage(new FormData(formRef.current));
    stages.forEach((timer) => window.clearTimeout(timer));
    setPending(false);
    setResult(response);
    if (response?.success) {
      setProgress({ percent: 100, label: 'Página completa publicada.' });
      setPageContent(response.pageContent);
    } else {
      setProgress(null);
    }
  }

  function updateContent(field, value) {
    setPageContent((current) => ({ ...(current || emptyContent()), [field]: value }));
  }

  function updateList(field, index, key, value) {
    setPageContent((current) => ({
      ...(current || emptyContent()),
      [field]: (current?.[field] || []).map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  }

  function addList(field, item) {
    setPageContent((current) => ({ ...(current || emptyContent()), [field]: [...(current?.[field] || []), item] }));
  }

  function removeList(field, index) {
    setPageContent((current) => ({ ...(current || emptyContent()), [field]: (current?.[field] || []).filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function savePageContent() {
    setPending(true);
    setSaveMessage(null);
    const response = await savePropertyLaunchPageContent(imovel.slug, pageContent);
    setPending(false);
    setSaveMessage(response?.error || (response?.success ? 'Alterações da página salvas.' : 'Não foi possível salvar agora.'));
  }

  const content = pageContent || emptyContent();

  return (
    <section className="admin-form-section admin-subdomain-section">
      <h2>Página especial do lançamento</h2>
      <p className="admin-hint">Envie a referência para extrair textos, dados, seções e imagens disponíveis na página de origem e publicar a experiência completa no subdomínio.</p>
      <form className="admin-form admin-subdomain-form" onSubmit={handleSubmit} ref={formRef}>
        <input type="hidden" name="property_id" value={imovel.id} />
        <div className="admin-form-row">
          <label>Subdomínio<input name="subdomain" required value={subdomain} onChange={(event) => setSubdomain(toSubdomain(event.target.value))} placeholder="montblanchill" /><span className="admin-hint">Sem espaços, acentos ou hífens.</span></label>
          <label>Link de referência<input name="reference_url" type="url" value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} placeholder="https://..." /><span className="admin-hint">A importação usa o conteúdo disponível neste endereço.</span></label>
        </div>
        {url && <p className="admin-launch-url">{url}</p>}
        {progress && <div className="admin-reference-progress"><div className="admin-upload-progress-track"><div className="admin-upload-progress-fill" style={{ width: progress.percent + '%' }} /></div><span>{progress.label} {progress.percent}%</span></div>}
        {result?.error && <p className="admin-form-error">{result.error}</p>}
        {result?.success && <p className="admin-form-success">Página publicada com {result.extracted?.sections || 0} seções, {result.extracted?.facts || 0} dados técnicos e {result.extracted?.images || 0} imagens. <a href={result.url} target="_blank" rel="noreferrer">Abrir subdomínio →</a></p>}
        <div className="admin-submit-row">
          <button className="button" type="button" disabled={pending || !referenceUrl.trim()} onClick={handleImport}>{pending ? 'Importando e publicando…' : 'Importar referência e publicar página completa'}</button>
          <button className="button" type="submit" disabled={pending}>{launch?.status === 'published' ? 'Publicar sem nova importação' : 'Publicar com dados do imóvel'}</button>
          {launch?.status === 'published' && <a className="admin-secondary-button" href={'https://' + launch.subdomain + '.casacomleo.com.br'} target="_blank" rel="noreferrer">Ver página</a>}
        </div>
      </form>

      {pageContent && (
        <div className="admin-launch-editor">
          <h3>Editar página importada</h3>
          <p className="admin-hint">Altere qualquer texto, adicione ou remova dados, seções e itens da ficha técnica. A página pública só muda quando você salvar.</p>
          <label>Título<input value={content.title || ''} onChange={(event) => updateContent('title', event.target.value)} /></label>
          <label>Texto do topo<textarea value={content.hero || ''} onChange={(event) => updateContent('hero', event.target.value)} /></label>
          <label>Apresentação<textarea value={content.summary || ''} onChange={(event) => updateContent('summary', event.target.value)} /></label>
          <EditableList title="Números e destaques" items={content.stats || []} fields={['value', 'label']} labels={['Número', 'Descrição']} onChange={(index, key, value) => updateList('stats', index, key, value)} onAdd={() => addList('stats', { value: '', label: '' })} onRemove={(index) => removeList('stats', index)} />
          <EditableList title="Seções da página" items={content.sections || []} fields={['title', 'text']} labels={['Título da seção', 'Texto']} onChange={(index, key, value) => updateList('sections', index, key, value)} onAdd={() => addList('sections', { title: '', text: '' })} onRemove={(index) => removeList('sections', index)} multiline="text" />
          <EditableList title="Ficha técnica" items={content.facts || []} fields={['label', 'value']} labels={['Campo', 'Informação']} onChange={(index, key, value) => updateList('facts', index, key, value)} onAdd={() => addList('facts', { label: '', value: '' })} onRemove={(index) => removeList('facts', index)} />
          {saveMessage && <p className={saveMessage === 'Alterações da página salvas.' ? 'admin-form-success' : 'admin-form-error'}>{saveMessage}</p>}
          <button className="button" type="button" disabled={pending} onClick={savePageContent}>{pending ? 'Salvando…' : 'Salvar alterações da página'}</button>
        </div>
      )}
    </section>
  );
}

function EditableList({ title, items, fields, labels, onChange, onAdd, onRemove, multiline }) {
  return (
    <div className="admin-launch-editor-list">
      <h4>{title}</h4>
      {items.map((item, index) => <div className="admin-launch-editor-item" key={index}>{fields.map((field, fieldIndex) => <label key={field}>{labels[fieldIndex]}{multiline === field ? <textarea value={item[field] || ''} onChange={(event) => onChange(index, field, event.target.value)} /> : <input value={item[field] || ''} onChange={(event) => onChange(index, field, event.target.value)} />}</label>)}<button type="button" onClick={() => onRemove(index)}>Remover</button></div>)}
      <button className="admin-secondary-button" type="button" onClick={onAdd}>+ Adicionar</button>
    </div>
  );
}
