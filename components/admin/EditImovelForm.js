'use client';

import { useState } from 'react';
import { updateImovel, createUploadTickets } from '@/app/admin/actions';
import { uploadFilesWithProgress } from '@/lib/client-upload';

export default function EditImovelForm({ imovel }) {
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [fotosAtuais, setFotosAtuais] = useState(imovel.fotos || []);

  function removerFoto(url) {
    setFotosAtuais((atual) => atual.filter((foto) => foto !== url));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll('fotos').filter((file) => file instanceof File && file.size > 0);

    formData.set('id', imovel.id);
    formData.set('fotos_atuais', JSON.stringify(fotosAtuais));

    if (files.length === 0) {
      formData.set('foto_paths', '[]');
      setPending(true);
      const result = await updateImovel(formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
      }
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

    const result = await updateImovel(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      setProgress(null);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-section">
        <h2>Identificação</h2>
        <div className="admin-form-row">
          <label>
            Título
            <input name="titulo" required defaultValue={imovel.titulo} />
          </label>
          <label>
            Tag de destaque no topo
            <input name="eyebrow" defaultValue={imovel.eyebrow} />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Localização e tipo</h2>
        <div className="admin-form-row">
          <label>
            Localização (filtro)
            <select name="localizacao_filtro" required defaultValue={imovel.localizacao_filtro || 'itacimirim'}>
              <option value="salvador">Salvador</option>
              <option value="praia-do-forte">Praia do Forte</option>
              <option value="itacimirim">Itacimirim</option>
              <option value="guarajuba">Guarajuba</option>
            </select>
          </label>
          <label>
            Localização (texto customizado, opcional)
            <input name="localizacao_custom" defaultValue={imovel.localizacao} />
          </label>
          <label>
            Categoria
            <select name="categoria" required defaultValue={imovel.categoria || 'casa'}>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="cobertura">Cobertura</option>
            </select>
          </label>
        </div>
        <div className="admin-checkbox-row">
          <label>
            <input type="checkbox" name="modalidades" value="venda" defaultChecked={(imovel.modalidades || []).includes('venda')} /> Venda
          </label>
          <label>
            <input
              type="checkbox"
              name="modalidades"
              value="temporada"
              defaultChecked={(imovel.modalidades || []).includes('temporada')}
            />{' '}
            Temporada
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Números</h2>
        <div className="admin-form-row">
          <label>
            Preço (R$)
            <input name="preco" type="number" min="0" step="1000" required defaultValue={imovel.preco} />
          </label>
          <label>
            Área (m²)
            <input name="area_m2" type="number" min="0" step="1" required defaultValue={imovel.area_m2} />
          </label>
          <label>
            Rótulo da área
            <select name="area_label" defaultValue={imovel.area_label || 'Área construída'}>
              <option value="Área construída">Área construída</option>
              <option value="Área privativa">Área privativa</option>
            </select>
          </label>
          <label>
            Suítes
            <input name="suites" type="number" min="0" defaultValue={imovel.suites} />
          </label>
          <label>
            Vagas
            <input name="vagas" type="number" min="0" defaultValue={imovel.vagas} />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Apresentação</h2>
        <label>
          Frase de destaque
          <input name="headline" required defaultValue={imovel.headline} />
        </label>
        <label>
          Primeiro parágrafo
          <textarea name="paragrafo_1" required defaultValue={imovel.paragrafo_1}></textarea>
        </label>
        <label>
          Segundo parágrafo (opcional)
          <textarea name="paragrafo_2" defaultValue={imovel.paragrafo_2 || ''}></textarea>
        </label>
      </div>

      <div className="admin-form-section">
        <h2>Detalhes extras (opcional)</h2>
        <span className="admin-hint">Até 3 pares de rótulo/valor, ex: &quot;Rooftop&quot; / &quot;Área externa&quot;.</span>
        {[0, 1, 2].map((i) => (
          <div className="admin-form-row" key={i}>
            <label>
              Valor {i + 1}
              <input name={`spec_${i + 1}_value`} defaultValue={imovel.specs_extra?.[i]?.value || ''} />
            </label>
            <label>
              Rótulo {i + 1}
              <input name={`spec_${i + 1}_label`} defaultValue={imovel.specs_extra?.[i]?.label || ''} />
            </label>
          </div>
        ))}
      </div>

      <div className="admin-form-section">
        <h2>Fotos</h2>
        {fotosAtuais.length > 0 && (
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
          Adicionar novas fotos
          <input type="file" name="fotos" accept="image/*" multiple />
        </label>
      </div>

      <div className="admin-checkbox-row">
        <label>
          <input type="checkbox" name="destaque" defaultChecked={imovel.destaque} /> Publicado (aparece no catálogo)
        </label>
        <label>
          <input type="checkbox" name="vendido" defaultChecked={imovel.vendido} /> Vendido
        </label>
      </div>

      {progress && (
        <div className="admin-upload-progress">
          <div className="admin-upload-progress-track">
            <div className="admin-upload-progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
          <span>
            {progress.phase === 'uploading' ? `Enviando fotos… ${progress.percent}%` : 'Salvando alterações…'}
          </span>
        </div>
      )}

      {error && <p className="admin-form-error">{error}</p>}

      <div className="admin-submit-row">
        <button className="button" type="submit" disabled={pending}>
          {pending ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
}
