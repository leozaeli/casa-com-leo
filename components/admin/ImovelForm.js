'use client';

import { useState } from 'react';
import { createImovel, updateImovel, createUploadTickets } from '@/app/admin/actions';
import { uploadFilesWithProgress } from '@/lib/client-upload';
import SpecsExtraEditor from '@/components/admin/SpecsExtraEditor';

export default function ImovelForm({ mode, imovel, localizacoes }) {
  const isEdit = mode === 'editar';
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [success, setSuccess] = useState(false);
  const [savedUrl, setSavedUrl] = useState(null);
  const [fotosAtuais, setFotosAtuais] = useState(imovel?.fotos || []);
  const [specsExtra, setSpecsExtra] = useState(
    imovel?.specs_extra && imovel.specs_extra.length > 0 ? imovel.specs_extra : []
  );

  function removerFoto(url) {
    setFotosAtuais((atual) => atual.filter((foto) => foto !== url));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSavedUrl(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll('fotos').filter((file) => file instanceof File && file.size > 0);

    if (isEdit) {
      formData.set('id', imovel.id);
      formData.set('fotos_atuais', JSON.stringify(fotosAtuais));
    } else if (files.length === 0) {
      setError('Envie ao menos uma foto.');
      return;
    }

    formData.set('specs_extra', JSON.stringify(specsExtra.filter((spec) => spec.value?.trim() && spec.label?.trim())));

    async function submit() {
      const result = isEdit ? await updateImovel(formData) : await createImovel(null, formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
        setProgress(null);
        return;
      }
      if (result?.url) setSavedUrl(result.url);
      if (!isEdit) {
        form.reset();
        setSpecsExtra([]);
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

    try {
      await uploadFilesWithProgress(ticketsResult.tickets, files, (percent) => {
        setProgress({ phase: 'uploading', percent });
      });
    } catch {
      setError('Falha ao enviar as fotos. Verifique sua conexão e tente novamente.');
      setPending(false);
      setProgress(null);
      return;
    }

    setProgress({ phase: 'processing', percent: 100 });
    formData.delete('fotos');
    formData.set('foto_paths', JSON.stringify(ticketsResult.tickets.map((t) => t.path)));
    await submit();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-section">
        <h2>Valor</h2>
        <label>
          Preço (R$)
          <input name="preco" type="number" min="0" step="1000" required defaultValue={imovel?.preco} placeholder="8900000" />
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
      </div>

      <div className="admin-form-section">
        <h2>Números</h2>
        <div className="admin-form-row">
          <label>
            Área (m²)
            <input name="area_m2" type="number" min="0" step="1" required defaultValue={imovel?.area_m2} placeholder="420" />
          </label>
          <label>
            Rótulo da área
            <select name="area_label" defaultValue={imovel?.area_label || 'Área construída'}>
              <option value="Área construída">Área construída</option>
              <option value="Área privativa">Área privativa</option>
              <option value="Área do terreno">Área do terreno</option>
            </select>
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
            defaultValue={isEdit ? [imovel.paragrafo_1, imovel.paragrafo_2].filter(Boolean).join(' ') : ''}
            placeholder="Escreva livremente sobre o imóvel: a história, o entorno, a rotina de quem mora ali, detalhes que fazem diferença..."
          ></textarea>
          <span className="admin-hint">
            A IA transforma essa descrição no texto de apresentação da página, de forma robusta e completa.
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
          {isEdit ? 'Adicionar novas fotos' : 'Fotos do imóvel (a primeira vira a capa)'}
          <input type="file" name="fotos" accept="image/*" multiple required={!isEdit} />
        </label>
      </div>

      <div className="admin-checkbox-row">
        <label>
          <input type="checkbox" name="destaque" defaultChecked={isEdit ? imovel.destaque : true} /> Publicado (aparece no
          catálogo)
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
