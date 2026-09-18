'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { createImovel, updateImovel, createUploadTickets, readPropertyReference } from '@/app/admin/actions';
import { uploadFilesWithProgress } from '@/lib/client-upload';
import SpecsExtraEditor from '@/components/admin/SpecsExtraEditor';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false });

export default function ImovelForm({ mode, imovel, localizacoes, launchMode = false }) {
  const isEdit = mode === 'editar';
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [success, setSuccess] = useState(false);
  const [savedUrl, setSavedUrl] = useState(null);
  const [launchSetupUrl, setLaunchSetupUrl] = useState(null);
  const [launchUrl, setLaunchUrl] = useState(null);
  const [fotosAtuais, setFotosAtuais] = useState(imovel?.fotos || []);
  const [uploads, setUploads] = useState([]);
  const [specsExtra, setSpecsExtra] = useState(
    imovel?.specs_extra && imovel.specs_extra.length > 0 ? imovel.specs_extra : []
  );
  const [isLaunch, setIsLaunch] = useState(launchMode || Boolean(imovel?.is_launch));
  const [sourceMode, setSourceMode] = useState(launchMode || imovel?.reference_url ? 'reference' : 'manual');
  const [createSubdomain, setCreateSubdomain] = useState(launchMode || Boolean(imovel?.is_launch && imovel?.reference_url));
  const [launchSubdomain, setLaunchSubdomain] = useState('');
  const [referenceUrl, setReferenceUrl] = useState(imovel?.reference_url || '');
  const [description, setDescription] = useState(
    isEdit ? [imovel.paragrafo_1, imovel.paragrafo_2].filter(Boolean).join(' ') : ''
  );
  const [readingReference, setReadingReference] = useState(false);
  const [referenceMessage, setReferenceMessage] = useState(null);

  function removerFoto(url) {
    setFotosAtuais((atual) => atual.filter((foto) => foto !== url));
  }

  function handleFilesChange(event) {
    const novos = Array.from(event.target.files || []);
    setUploads((atual) => [
      ...atual,
      ...novos.map((file) => ({ file, name: file.name, url: URL.createObjectURL(file), status: 'pendente', error: null })),
    ]);
    event.target.value = '';
  }

  function removerUpload(index) {
    setUploads((atual) => {
      const alvo = atual[index];
      if (alvo) URL.revokeObjectURL(alvo.url);
      return atual.filter((_, i) => i !== index);
    });
  }

  function selectSourceMode(nextMode) {
    setSourceMode(nextMode);
    if (nextMode === 'reference') {
      setIsLaunch(true);
      setCreateSubdomain(true);
    }
  }

  async function handleReadReference() {
    setReferenceMessage(null);
    setError(null);
    setReadingReference(true);
    const result = await readPropertyReference(referenceUrl);
    setReadingReference(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDescription(result.description);
    setReferenceMessage('Referência lida. Revise o texto abaixo, complete os dados do imóvel e publique a página.');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSavedUrl(null);
    setLaunchSetupUrl(null);
    setLaunchUrl(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.delete('fotos');
    const files = uploads.map((u) => u.file);

    if (isEdit) {
      formData.set('id', imovel.id);
      formData.set('fotos_atuais', JSON.stringify(fotosAtuais));
    }

    formData.set('specs_extra', JSON.stringify(specsExtra.filter((spec) => spec.value?.trim() || spec.label?.trim())));

    async function submit() {
      const result = isEdit ? await updateImovel(formData) : await createImovel(null, formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
        setProgress(null);
        return;
      }
      if (result?.url) setSavedUrl(result.url);
      if (result?.editUrl) setLaunchSetupUrl(result.editUrl);
      if (result?.launchUrl) setLaunchUrl(result.launchUrl);
      if (result?.warning) setError(result.warning);
      if (!isEdit) {
        form.reset();
        setSpecsExtra([]);
        setUploads([]);
        setDescription('');
        setReferenceUrl('');
        setReferenceMessage(null);
        setSourceMode(launchMode ? 'reference' : 'manual');
        setIsLaunch(launchMode);
        setCreateSubdomain(launchMode);
        setLaunchSubdomain('');
      }
      setPending(false);
      setProgress(null);
      setSuccess(true);
    }

    if (files.length === 0) {
      formData.set('foto_paths', '[]');
      setPending(true);
      await submit();
      return;
    }

    setPending(true);
    setProgress({ phase: 'uploading', percent: 0 });

    const ticketsFd = new FormData();
    ticketsFd.set('bucket', 'imoveis-fotos');
    ticketsFd.set('count', String(files.length));
    const ticketsResult = await createUploadTickets(ticketsFd);
    if (ticketsResult?.error) {
      setError(ticketsResult.error);
      setPending(false);
      setProgress(null);
      return;
    }

    setUploads((atual) => atual.map((u) => ({ ...u, status: 'enviando' })));

    const results = await uploadFilesWithProgress(
      ticketsResult.tickets,
      files,
      (percent) => setProgress({ phase: 'uploading', percent }),
      (i, result) => {
        setUploads((atual) =>
          atual.map((u, idx) => (idx === i ? { ...u, status: result.ok ? 'ok' : 'erro', error: result.error } : u))
        );
      }
    );

    const nomesComFalha = results.map((r, i) => (!r.ok ? files[i].name : null)).filter(Boolean);
    const pathsEnviados = results.filter((r) => r.ok).map((r) => r.path);

    if (pathsEnviados.length === 0 && !isEdit) {
      setError('Nenhuma foto foi enviada. Verifique sua conexão e tente novamente.');
      setPending(false);
      setProgress(null);
      return;
    }

    if (nomesComFalha.length > 0) {
      setError(`Falha ao enviar: ${nomesComFalha.join(', ')}. As demais fotos foram enviadas normalmente.`);
    }

    setProgress({ phase: 'processing', percent: 100 });
    formData.set('foto_paths', JSON.stringify(pathsEnviados));
    await submit();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-section">
        <h2>Valor</h2>
        <label>
          Preço (R$)
          <input name="preco" type="number" min="0" step="1000" defaultValue={imovel?.preco || ''} placeholder="8900000" />
        </label>
        <label className="admin-check-label">
          <input type="checkbox" name="valor_sob_consulta" defaultChecked={Boolean(imovel && !Number(imovel.preco))} /> Valor sob consulta
        </label>
      </div>

      <div className="admin-form-section">
        <h2>Identificação</h2>
        <div className="admin-form-row">
          <label>
            Título
            <input name="titulo" required defaultValue={imovel?.titulo} placeholder="Ex: Casa Itacimirim" />
          </label>
          <label>
            Tag de destaque no topo
            <input name="eyebrow" defaultValue={imovel?.eyebrow} placeholder="Ex: Casa · Exclusivo" />
          </label>
        </div>
        <div className="admin-checkbox-row">
          {launchMode && <input type="hidden" name="is_launch" value="on" />}
          <label>
            <input type="checkbox" name={launchMode ? undefined : 'is_launch'} checked={isLaunch} disabled={launchMode} onChange={(event) => setIsLaunch(event.target.checked)} /> É lançamento
          </label>
          {!isEdit && (
            <label>
              <input type="checkbox" name="create_subdomain" checked={createSubdomain} onChange={(event) => { setCreateSubdomain(event.target.checked); if (event.target.checked) setIsLaunch(true); }} /> Criar página no subdomínio
            </label>
          )}
        </div>
        {!isEdit && createSubdomain && (
          <label>
            Subdomínio da página
            <input name="launch_subdomain" value={launchSubdomain} onChange={(event) => setLaunchSubdomain(event.target.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ''))} placeholder="montblanchill" />
            <span className="admin-hint">Se ficar vazio, o endereço será criado a partir do título.</span>
          </label>
        )}
        <div className="admin-reference-builder">
          <p className="admin-reference-builder-title">{launchMode ? 'Como deseja montar este lançamento?' : 'Como deseja montar este imóvel?'}</p>
          <div className="admin-choice-cards">
            <label className={`admin-choice-card ${sourceMode === 'manual' ? 'active' : ''}`}>
              <input type="radio" name="property_source_mode" value="manual" checked={sourceMode === 'manual'} onChange={() => selectSourceMode('manual')} />
              <b>Preencher manualmente</b>
              <span>Cadastre as informações com seus próprios textos e imagens.</span>
            </label>
            <label className={`admin-choice-card ${sourceMode === 'reference' ? 'active' : ''}`}>
              <input type="radio" name="property_source_mode" value="reference" checked={sourceMode === 'reference'} onChange={() => selectSourceMode('reference')} />
              <b>Montar a partir de um link</b>
              <span>Lemos a página de referência e usamos seu conteúdo para construir a apresentação deste imóvel.</span>
            </label>
          </div>
          {sourceMode === 'reference' && (
            <div className="admin-reference-fields">
              <label>
                Link de referência
                <input name="reference_url" type="url" value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} required placeholder="https://..." />
                <span className="admin-hint">O link fica registrado neste imóvel para consulta posterior.</span>
              </label>
              <button className="admin-secondary-button" type="button" disabled={readingReference || !referenceUrl.trim()} onClick={handleReadReference}>
                {readingReference ? 'Lendo referência…' : 'Ler link e preparar apresentação'}
              </button>
              {referenceMessage && <p className="admin-form-success">{referenceMessage}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Localização e tipo</h2>
        <div className="admin-form-row">
          <label>
            Localização
            <select name="localizacao_filtro" required defaultValue={imovel?.localizacao_filtro || localizacoes[0]?.slug}>
              {localizacoes.map((loc) => (
                <option key={loc.slug} value={loc.slug}>
                  {loc.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Categoria
            <select name="categoria" required defaultValue={imovel?.categoria || 'casa'}>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="cobertura">Cobertura</option>
              <option value="terreno">Terreno</option>
            </select>
          </label>
        </div>
        <div className="admin-checkbox-row">
          <label>
            <input
              type="checkbox"
              name="modalidades"
              value="venda"
              defaultChecked={isEdit ? (imovel.modalidades || []).includes('venda') : true}
            />{' '}
            Venda
          </label>
          <label>
            <input
              type="checkbox"
              name="modalidades"
              value="temporada"
              defaultChecked={isEdit ? (imovel.modalidades || []).includes('temporada') : false}
            />{' '}
            Temporada
          </label>
        </div>
        <span className="admin-hint">
          Não achou a localização? <a href="/admin/imoveis/localizacoes">Adicionar localização →</a>
        </span>
        <LocationPicker defaultValue={imovel?.mapa_url} />
      </div>

      <div className="admin-form-section">
        <h2>Números</h2>
        <div className="admin-form-row">
          <label>
            Área total (m²)
            <input name="area_total_m2" type="text" inputMode="decimal" defaultValue={imovel?.area_total_m2 ?? ''} placeholder="145,67" />
          </label>
          <label>
            Área construída (m²)
            <input name="area_m2" type="text" inputMode="decimal" required defaultValue={imovel?.area_m2} placeholder="145,67" />
          </label>
          <label>
            Quartos
            <input name="quartos" type="number" min="0" defaultValue={imovel?.quartos ?? 0} />
          </label>
          <label>
            Suítes
            <input name="suites" type="number" min="0" defaultValue={imovel?.suites ?? 0} />
          </label>
          <label>
            Vagas
            <input name="vagas" type="number" min="0" defaultValue={imovel?.vagas ?? 0} />
          </label>
        </div>
        <span className="admin-hint">Tudo que for preenchido aqui vira um label na página do imóvel.</span>
      </div>

      <SpecsExtraEditor specs={specsExtra} onChange={setSpecsExtra} />

      <div className="admin-form-section">
        <h2>Apresentação</h2>
        <label>
          Frase de destaque
          <input name="headline" required defaultValue={imovel?.headline} placeholder="Ex: Arquitetura que deixa a vida entrar." />
          <span className="admin-hint">Usada exatamente como está escrita — a IA não altera essa frase.</span>
        </label>
        <label>
          Descrição
          <textarea
            name="descricao"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Escreva livremente sobre o imóvel: a história, o entorno, a rotina de quem mora ali, detalhes que fazem diferença..."
          ></textarea>
          <span className="admin-hint">
            A IA transforma essa descrição em um único parágrafo de apresentação, puxando o que há de mais legal
            do que você escrever, sem enfeitar demais.
          </span>
        </label>
      </div>

      <div className="admin-form-section">
        <h2>Fotos</h2>
        {isEdit && fotosAtuais.length > 0 && (
          <div className="admin-photo-grid">
            {fotosAtuais.map((foto) => (
              <div className="admin-photo-thumb" key={foto}>
                <img src={foto} alt="" />
                <button type="button" onClick={() => removerFoto(foto)} aria-label="Remover foto">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <label>
          {isEdit ? 'Adicionar novas fotos' : 'Fotos do imóvel (opcional — a referência pode fornecer imagens para a página de lançamento)'}
          <input type="file" name="fotos" accept="image/*" multiple onChange={handleFilesChange} />
        </label>
        {uploads.length > 0 && (
          <div className="admin-photo-grid">
            {uploads.map((u, i) => (
              <div className={`admin-photo-thumb admin-photo-thumb-${u.status}`} key={`${u.name}-${i}`} title={u.error || u.name}>
                <img src={u.url} alt="" />
                {!pending && (
                  <button type="button" onClick={() => removerUpload(i)} aria-label="Remover foto">
                    ✕
                  </button>
                )}
                {u.status === 'enviando' && <span className="admin-photo-status">Enviando…</span>}
                {u.status === 'ok' && <span className="admin-photo-status admin-photo-status-ok">✓</span>}
                {u.status === 'erro' && <span className="admin-photo-status admin-photo-status-erro">Falhou</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-checkbox-row">
        <label>
          <input type="checkbox" name="destaque" defaultChecked={isEdit ? imovel.destaque : true} /> Destaque (aparece primeiro
          na home e no catálogo)
        </label>
        {isEdit && (
          <label>
            <input type="checkbox" name="vendido" defaultChecked={imovel.vendido} /> Vendido
          </label>
        )}
      </div>

      {progress && (
        <div className="admin-upload-progress">
          <div className="admin-upload-progress-track">
            <div className="admin-upload-progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
          <span>
            {progress.phase === 'uploading'
              ? `Enviando fotos… ${progress.percent}%`
              : isEdit
                ? 'Salvando alterações…'
                : 'Gerando texto e publicando…'}
          </span>
        </div>
      )}

      {success && (
        <p className="admin-form-success">
          {isEdit ? 'Alterações salvas.' : 'Imóvel publicado.'}{' '}
          {savedUrl && (
            <a href={savedUrl} target="_blank" rel="noopener noreferrer">
              Ver página →
            </a>
          )}
          {launchSetupUrl && (
            <> <a href={launchSetupUrl}>Criar página no subdomínio →</a></>
          )}
          {launchUrl && (
            <> <a href={launchUrl} target="_blank" rel="noopener noreferrer">Ver subdomínio →</a></>
          )}
        </p>
      )}
      {error && <p className="admin-form-error">{error}</p>}

      <div className="admin-submit-row">
        <button className="button" type="submit" disabled={pending}>
          {pending
            ? progress?.phase === 'uploading'
              ? `Enviando… ${progress.percent}%`
              : isEdit
                ? 'Salvando…'
                : 'Publicando…'
            : isEdit
              ? 'Salvar alterações'
              : 'Publicar imóvel'}
        </button>
      </div>
    </form>
  );
}
