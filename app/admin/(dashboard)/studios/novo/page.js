'use client';

import { useState } from 'react';
import { createStudio, createUploadTickets } from '@/app/admin/actions';
import { uploadFilesWithProgress } from '@/lib/client-upload';

export default function NovoStudioPage() {
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll('fotos').filter((file) => file instanceof File && file.size > 0);
    if (files.length === 0) {
      setError('Envie ao menos uma foto.');
      return;
    }

    setPending(true);
    setProgress({ phase: 'uploading', percent: 0 });

    const ticketsFd = new FormData();
    ticketsFd.set('bucket', 'studios-fotos');
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

    const result = await createStudio(null, formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      setProgress(null);
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Cadastro</span>
          <h1>Novo studio</h1>
          <p className="admin-page-subtitle">Preencha os dados abaixo — a página da unidade é criada automaticamente ao publicar.</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-section">
          <h2>Identificação</h2>
          <div className="admin-form-row">
            <label>
              Título
              <input name="titulo" required placeholder="Ex: Studio 12 — Praia do Forte" />
            </label>
            <label>
              Endereço da página (slug)
              <input name="slug" placeholder="deixe em branco para gerar do título" />
              <span className="admin-hint">Vira /studios/seu-texto-aqui</span>
            </label>
          </div>
          <label>
            Tag de destaque no topo
            <input name="eyebrow" placeholder="Ex: Studio · StudioHUB" />
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Localização e tipo</h2>
          <div className="admin-form-row">
            <label>
              Localização
              <input name="localizacao" required placeholder="Ex: Praia do Forte · Bahia" />
            </label>
            <label>
              Tipologia
              <select name="tipologia" required defaultValue="studio">
                <option value="studio">Studio</option>
                <option value="quarto-e-sala">Quarto e Sala</option>
              </select>
            </label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Números</h2>
          <div className="admin-form-row">
            <label>
              Preço a partir de (R$)
              <input name="preco" type="number" min="0" step="1000" required placeholder="350000" />
            </label>
            <label>
              Área (m²)
              <input name="area_m2" type="number" min="0" step="1" required placeholder="28" />
            </label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Apresentação</h2>
          <label>
            Ideia central
            <textarea
              name="ideia_central"
              required
              placeholder="Escreva em poucas palavras o que torna essa unidade especial. Ex: studio compacto pra quem quer morar perto da praia sem abrir mão de conforto."
            ></textarea>
            <span className="admin-hint">
              A IA transforma essa ideia em um texto de apresentação emocional e simples ao publicar.
            </span>
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Comodidades e diferenciais (opcional)</h2>
          <label>
            Comodidades
            <textarea
              name="comodidades"
              placeholder="Liste solto o que tiver, sem se preocupar com formato. Ex: entrega prevista 2027, varanda gourmet, piscina no rooftop, ambientes climatizados, mobiliado."
            ></textarea>
            <span className="admin-hint">
              A IA escolhe os destaques mais relevantes dessa lista para mostrar na página da unidade.
            </span>
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Fotos</h2>
          <label>
            Fotos da unidade (a primeira vira a capa)
            <input type="file" name="fotos" accept="image/*" multiple required />
          </label>
        </div>

        <div className="admin-checkbox-row">
          <label>
            <input type="checkbox" name="destaque" defaultChecked /> Publicado (aparece no catálogo)
          </label>
        </div>

        {progress && (
          <div className="admin-upload-progress">
            <div className="admin-upload-progress-track">
              <div className="admin-upload-progress-fill" style={{ width: `${progress.percent}%` }} />
            </div>
            <span>
              {progress.phase === 'uploading' ? `Enviando fotos… ${progress.percent}%` : 'Gerando texto e publicando…'}
            </span>
          </div>
        )}

        {error && <p className="admin-form-error">{error}</p>}

        <div className="admin-submit-row">
          <button className="button" type="submit" disabled={pending}>
            {pending ? (progress?.phase === 'uploading' ? `Enviando… ${progress.percent}%` : 'Publicando…') : 'Publicar studio'}
          </button>
        </div>
      </form>
    </div>
  );
}
