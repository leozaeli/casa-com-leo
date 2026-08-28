'use client';

import { useState } from 'react';
import { createImovel, createUploadTickets } from '@/app/admin/actions';
import { uploadFilesWithProgress } from '@/lib/client-upload';

export default function NovoImovelPage() {
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [success, setSuccess] = useState(false);

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

    const result = await createImovel(null, formData);
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
    setPending(false);
    setProgress(null);
    setSuccess(true);
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Cadastro</span>
          <h1>Novo imóvel</h1>
          <p className="admin-page-subtitle">
            Preencha o valor, cole as informações do imóvel e envie as fotos — a IA identifica o resto (título,
            localização, tipo, área, suítes, vagas e os destaques) e cria a página automaticamente ao publicar.
          </p>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-section">
          <h2>Valor</h2>
          <label>
            Preço (R$)
            <input name="preco" type="number" min="0" step="1000" required placeholder="8900000" />
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Informações do imóvel</h2>
          <label>
            Cole aqui as informações do imóvel
            <textarea
              name="texto_bruto"
              required
              placeholder="Cole a descrição, anúncio ou mensagem com os detalhes do imóvel: nome/apelido, localização, tipo (casa, apartamento, cobertura, terreno), área, suítes, vagas, comodidades (piscina, churrasqueira, vista etc.), venda e/ou temporada..."
            ></textarea>
            <span className="admin-hint">
              A IA lê esse texto e identifica sozinha o título, a localização, o tipo, a área, as suítes, as vagas, a
              modalidade e os destaques mais importantes para mostrar na página.
            </span>
          </label>
          <label>
            Frase de destaque (opcional)
            <input name="frase_destaque" placeholder="Ex: Arquitetura que deixa a vida entrar." />
            <span className="admin-hint">
              Se preencher, essa frase é usada exatamente como está. Se deixar em branco, a IA cria uma pra você.
            </span>
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Fotos</h2>
          <label>
            Fotos do imóvel (a primeira vira a capa)
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

        {success && <p className="admin-form-success">Imóvel publicado — a página abriu em uma nova aba.</p>}
        {error && <p className="admin-form-error">{error}</p>}

        <div className="admin-submit-row">
          <button className="button" type="submit" disabled={pending}>
            {pending ? (progress?.phase === 'uploading' ? `Enviando… ${progress.percent}%` : 'Publicando…') : 'Publicar imóvel'}
          </button>
        </div>
      </form>
    </div>
  );
}
