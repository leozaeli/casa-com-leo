'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'casa', label: 'Casas' },
  { key: 'apartamento', label: 'Apartamentos' },
  { key: 'cobertura', label: 'Coberturas' },
  { key: 'terreno', label: 'Terrenos' },
];

function priceLabel(price) {
  if (!Number(price)) return 'Sob consulta';
  const millions = price / 1000000;
  return millions >= 1 ? 'R$ ' + millions.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi' : 'R$ ' + price.toLocaleString('pt-BR');
}

function propertyHref(property) {
  return property.launch_url || '/imoveis/' + property.slug;
}

function areaPreview(property) {
  const area = property.categoria === 'terreno' ? property.area_total_m2 || property.area_m2 : property.area_m2 || property.area_total_m2;
  if (!area) return '— m²';
  return Number(area).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' m²' + (property.categoria === 'terreno' ? ' terreno' : '');
}

export default function HomeCatalog({ imoveis }) {
  const [filter, setFilter] = useState('todos');
  const trackRef = useRef(null);
  const visibleProperties = useMemo(() => (filter === 'todos' ? imoveis : imoveis.filter((imovel) => imovel.categoria === filter)), [filter, imoveis]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame;
    let lastTime;
    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    const tick = (time) => {
      if (!lastTime) lastTime = time;
      const elapsed = Math.min(time - lastTime, 80);
      lastTime = time;
      if (!paused && track.scrollWidth > track.clientWidth) {
        const edge = track.scrollWidth - track.clientWidth;
        track.scrollLeft = track.scrollLeft >= edge - 1 ? 0 : track.scrollLeft + (22 * elapsed) / 1000;
      }
      frame = requestAnimationFrame(tick);
    };
    track.addEventListener('pointerenter', pause);
    track.addEventListener('pointerleave', resume);
    track.addEventListener('focusin', pause);
    track.addEventListener('focusout', resume);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('pointerenter', pause);
      track.removeEventListener('pointerleave', resume);
      track.removeEventListener('focusin', pause);
      track.removeEventListener('focusout', resume);
    };
  }, [filter, visibleProperties.length]);

  function selectFilter(nextFilter) {
    setFilter(nextFilter);
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }

  return <>
    <div className="filter-row catalog-filter-row" role="tablist" aria-label="Filtrar imóveis por tipo">
      {FILTERS.map((item) => <button key={item.key} className={'filter ' + (filter === item.key ? 'active' : '')} type="button" role="tab" aria-selected={filter === item.key} onClick={() => selectFilter(item.key)}>{item.label}</button>)}
      <a className="filter" href="/studios">Studios</a>
    </div>
    {visibleProperties.length > 0 ? <div className="catalog-rail-shell">
      <div className="catalog-rail" ref={trackRef} aria-label={'Catálogo de ' + FILTERS.find((item) => item.key === filter)?.label.toLowerCase()}>
        {visibleProperties.map((imovel) => <div className="catalog-rail-item" key={imovel.id}>
          <a className="property-card catalog-rail-card" href={propertyHref(imovel)}>
            <div className="property-image"><img src={imovel.fotos?.[0] || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85'} alt={imovel.titulo} />{imovel.is_launch && <span className="property-launch-label">Lançamento</span>}{imovel.vendido ? <div className="property-sold-overlay"><span>Vendido</span></div> : <span className="property-tag"><span className="dot"></span>Disponível</span>}</div>
            <div className="property-info"><div className="property-info-top"><h3>{imovel.titulo}</h3><span className="property-price">{priceLabel(imovel.preco)}</span></div><p className="property-location">{imovel.localizacao}</p><div className="property-meta"><span>{imovel.suites || '—'} suítes</span><span>{imovel.vagas || '—'} vagas</span><span>{imovel.area_label || areaPreview(imovel)}</span></div>{imovel.unidades && <p className="property-units">{imovel.unidades} unidades</p>}</div>
          </a>
        </div>)}
      </div>
      <p className="catalog-rail-note">Role ou arraste para explorar o catálogo</p>
    </div> : <div className="admin-empty"><p>Nenhum imóvel nesta seleção no momento.</p></div>}
  </>;
}
