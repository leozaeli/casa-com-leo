'use client';

import { useState } from 'react';
import { createImovel, createUploadTickets } from '@/app/admin/actions';
import { uploadFilesWithProgress } from '@/lib/client-upload';
import SpecsExtraEditor from '@/components/admin/SpecsExtraEditor';

export default function NovoImovelPage() {
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
    formData.set('specs_extra', JSON.stringify(specsExtra.filter((spec) => spec.value?.trim() && spec.label?.trim())));

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
          <h1>Novo imóvel</h1>
          <p className="admin-page-subtitle">Preencha os dados abaixo — a página do imóvel é criada automaticamente ao publicar.</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-section">
          <h2>Identificação</h2>
          <div className="admin-form-row">
            <label>
              Título
              <input name="titulo" required placeholder="Ex: Casa Itacimirim" />
            </label>
            <label>
              Endereço da página (slug)
              <input name="slug" placeholder="deixe em branco para gerar do título" />
              <span className="admin-hint">Vira /imoveis/seu-texto-aqui</span>
            </label>
          </div>
          <label>
            Tag de destaque no topo
            <input name="eyebrow" placeholder="Ex: Casa · Exclusivo" />
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Localização e tipo</h2>
          <div className="admin-form-row">
            <label>
              Localização (filtro)
              <select name="localizacao_filtro" required defaultValue="itacimirim">
                <option value="salvador">Salvador</option>
                <option value="praia-do-forte">Praia do Forte</option>
                <option value="itacimirim">Itacimirim</option>
                <option value="guarajuba">Guarajuba</option>
              </select>
            </label>
            <label>
              Localização (texto customizado, opcional)
              <input name="localizacao_custom" placeholder="Ex: Itacimirim · Bahia" />
            </label>
            <label>
              Categoria
              <select name="categoria" required defaultValue="casa">
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="cobertura">Cobertura</option>
              </select>
            </label>
          </div>
          <div className="admin-checkbox-row">
            <label>
              <input type="checkbox" name="modalidades" value="venda" defaultChecked /> Venda
            </label>
            <label>
              <input type="checkbox" name="modalidades" value="temporada" /> Temporada
            </label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Números</h2>
          <div className="admin-form-row">
            <label>
              Preço (R$)
              <input name="preco" type="number" min="0" step="1000" required placeholder="8900000" />
            </label>
            <label>
              Área (m²)
              <input name="area_m2" type="number" min="0" step="1" required placeholder="420" />
            </label>
            <label>
              Rótulo da área
              <select name="area_label" defaultValue="Área construída">
                <option value="Área construída">Área construída</option>
                <option value="Área privativa">Área privativa</option>
              </select>
            </label>
            <label>
              Suítes
              <input name="suites" type="number" min="0" defaultValue="1" />
            </label>
            <label>
              Vagas
              <input name="vagas" type="number" min="0" defaultValue="1" />
            </label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Apresentação</h2>
          <label>
            Frase de destaque (opcional)
            <input name="frase_destaque" placeholder="Ex: Arquitetura que deixa a vida entrar." />
            <span className="admin-hint">
              Se preencher, essa frase é usada como está. Se deixar em branco, a IA cria uma pra você.
            </span>
          </label>
          <label>
            Ideia central
            <textarea
              name="ideia_central"
              required
              placeholder="Escreva em poucas palavras o que torna esse imóvel especial. Ex: casa de família à beira-mar, ideal para quem quer acordar ouvindo o mar todos os dias."
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
