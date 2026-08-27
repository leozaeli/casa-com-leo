'use client';

import { useActionState } from 'react';
import { createImovel } from '@/app/admin/actions';

const initialState = { error: null };

export default function NovoImovelPage() {
  const [state, formAction, pending] = useActionState(createImovel, initialState);

  return (
    <div>
      <div className="admin-page-head">
        <h1>Novo imóvel</h1>
      </div>

      <form className="admin-form" action={formAction}>
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
            Frase de destaque
            <input name="headline" required placeholder="Ex: Arquitetura que deixa a vida entrar." />
          </label>
          <label>
            Primeiro parágrafo
            <textarea name="paragrafo_1" required placeholder="Descreva o imóvel..."></textarea>
          </label>
          <label>
            Segundo parágrafo (opcional)
            <textarea name="paragrafo_2" placeholder="Mais detalhes..."></textarea>
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Detalhes extras (opcional)</h2>
          <span className="admin-hint">Até 3 pares de rótulo/valor, ex: &quot;Rooftop&quot; / &quot;Área externa&quot;.</span>
          {[1, 2, 3].map((i) => (
            <div className="admin-form-row" key={i}>
              <label>
                Valor {i}
                <input name={`spec_${i}_value`} placeholder="Ex: Rooftop" />
              </label>
              <label>
                Rótulo {i}
                <input name={`spec_${i}_label`} placeholder="Ex: Área externa" />
              </label>
            </div>
          ))}
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

        {state?.error && <p className="admin-form-error">{state.error}</p>}

        <div className="admin-submit-row">
          <button className="button" type="submit" disabled={pending}>
            {pending ? 'Salvando…' : 'Publicar imóvel'}
          </button>
        </div>
      </form>
    </div>
  );
}
