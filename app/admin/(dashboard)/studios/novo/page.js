'use client';

import { useActionState } from 'react';
import { createStudio } from '@/app/admin/actions';

const initialState = { error: null };

export default function NovoStudioPage() {
  const [state, formAction, pending] = useActionState(createStudio, initialState);

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Cadastro</span>
          <h1>Novo studio</h1>
          <p className="admin-page-subtitle">Preencha os dados abaixo — a página da unidade é criada automaticamente ao publicar.</p>
        </div>
      </div>

      <form className="admin-form" action={formAction}>
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
            Frase de destaque
            <input name="headline" required placeholder="Ex: Compacto por fora, completo por dentro." />
          </label>
          <label>
            Primeiro parágrafo
            <textarea name="paragrafo_1" required placeholder="Descreva a unidade..."></textarea>
          </label>
          <label>
            Segundo parágrafo (opcional)
            <textarea name="paragrafo_2" placeholder="Mais detalhes..."></textarea>
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Detalhes extras (opcional)</h2>
          <span className="admin-hint">Até 3 pares de rótulo/valor, ex: &quot;2027&quot; / &quot;Entrega prevista&quot;.</span>
          {[1, 2, 3].map((i) => (
            <div className="admin-form-row" key={i}>
              <label>
                Valor {i}
                <input name={`spec_${i}_value`} placeholder="Ex: 2027" />
              </label>
              <label>
                Rótulo {i}
                <input name={`spec_${i}_label`} placeholder="Ex: Entrega prevista" />
              </label>
            </div>
          ))}
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

        {state?.error && <p className="admin-form-error">{state.error}</p>}

        <div className="admin-submit-row">
          <button className="button" type="submit" disabled={pending}>
            {pending ? 'Salvando…' : 'Publicar studio'}
          </button>
        </div>
      </form>
    </div>
  );
}
