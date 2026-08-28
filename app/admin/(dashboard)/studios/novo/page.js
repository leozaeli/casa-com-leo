'use client';

import { useState } from 'react';
import { createStudio, createUploadTickets } from '@/app/admin/actions';
import { uploadFilesWithProgress } from '@/lib/client-upload';
import SpecsExtraEditor from '@/components/admin/SpecsExtraEditor';

export default function NovoStudioPage() {
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [success, setSuccess] = useState(false);
  const [specsExtra, setSpecsExtra] = useState([]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

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
    formData.set('specs_extra', JSON.stringify(specsExtra.filter((spec) => spec.value?.trim() && spec.label?.trim())));

    const result = await createStudio(null, formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      setProgress(null);
      return;
    }

    if (result?.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }

    form.reset();
    setSpecsExtra([]);
    setPending(false);
    setProgress(null);
    setSuccess(true);
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
            Frase de destaque (opcional)
            <input name="frase_destaque" placeholder="Ex: Compacto por fora, completo por dentro." />
            <span className="admin-hint">
              Se preencher, essa frase é usada como está. Se deixar em branco, a IA cria uma pra você.
            </span>
          </label>
          <label>
            Ideia central
            <textarea
              name="ideia_central"
              required
              placeholder="Escreva em poucas palavras o que torna essa unidade especial. Ex: studio compacto pra quem quer morar perto da praia sem abrir mão de conforto."
            ></textarea>
            <span className="admin-hint">
              A IA transforma essa ideia em um texto de apresentação emocional e simples ao publicar, e também
              identifica comodidades citadas (piscina, vagas, churrasqueira etc.) para destacar na página.
            </span>
          </label>
        </div>

        <SpecsExtraEditor specs={specsExtra} onChange={setSpecsExtra} />

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

        {success && <p className="admin-form-success">Unidade publicada — a página abriu em uma nova aba.</p>}
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
