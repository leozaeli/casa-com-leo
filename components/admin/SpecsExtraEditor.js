'use client';

export default function SpecsExtraEditor({ specs, onChange }) {
  function atualizar(index, campo, valor) {
    onChange(specs.map((spec, i) => (i === index ? { ...spec, [campo]: valor } : spec)));
  }

  function remover(index) {
    onChange(specs.filter((_, i) => i !== index));
  }

  function adicionar() {
    onChange([...specs, { value: '', label: '' }]);
  }

  return (
    <div className="admin-form-section">
      <h2>Informações técnicas</h2>
      <span className="admin-hint">
        Tudo que você preencher aqui vira um label na página do imóvel. Adicione quantos quiser. Ex: &quot;Sim&quot; /
        &quot;Piscina&quot;, &quot;2&quot; / &quot;Banheiros&quot;.
      </span>
      {specs.map((spec, index) => (
        <div className="admin-form-row admin-spec-row" key={index}>
          <label>
            Valor
            <input value={spec.value} onChange={(event) => atualizar(index, 'value', event.target.value)} placeholder="Ex: Rooftop" />
          </label>
          <label>
            Rótulo
            <input value={spec.label} onChange={(event) => atualizar(index, 'label', event.target.value)} placeholder="Ex: Área externa" />
          </label>
          <button type="button" className="admin-spec-remove" onClick={() => remover(index)} aria-label="Remover detalhe">
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="button ghost admin-spec-add" onClick={adicionar}>
        + Adicionar detalhe
      </button>
    </div>
  );
}
