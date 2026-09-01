'use client';

import { useEffect, useRef, useState } from 'react';

function parseValue(raw) {
  const trimmed = (raw || '').toString();
  const [address, coords] = trimmed.split('|');
  return { address: address || '', coords: coords || null };
}

export default function LocationPicker({ defaultValue }) {
  const initial = parseValue(defaultValue);
  const [query, setQuery] = useState(initial.address);
  const [coords, setCoords] = useState(initial.coords);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  function handleChange(event) {
    const value = event.target.value;
    setQuery(value);
    setCoords(null);
    clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=5&countrycodes=br&q=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  function selectSuggestion(item) {
    setQuery(item.display_name);
    setCoords(`${Number(item.lat).toFixed(6)},${Number(item.lon).toFixed(6)}`);
    setSuggestions([]);
    setOpen(false);
  }

  const hiddenValue = query.trim() ? (coords ? `${query}|${coords}` : query) : '';
  const previewSrc = coords
    ? `https://www.google.com/maps?q=${coords}&output=embed`
    : query.trim().length > 3
      ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
      : null;

  return (
    <div className="location-picker" ref={boxRef}>
      <label>
        Localização no mapa
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Comece a digitar o endereço…"
          autoComplete="off"
        />
      </label>
      <input type="hidden" name="mapa_url" value={hiddenValue} />
      {open && suggestions.length > 0 && (
        <ul className="location-picker-suggestions">
          {suggestions.map((item) => (
            <li key={item.place_id}>
              <button type="button" onClick={() => selectSuggestion(item)}>
                {item.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && <span className="admin-hint">Buscando endereços…</span>}
      {previewSrc && (
        <div className="location-picker-preview">
          <iframe src={previewSrc} loading="lazy" title="Prévia do mapa" />
        </div>
      )}
      <span className="admin-hint">
        Escolha uma sugestão da lista para fixar o ponto exato no mapa. Se preferir, também pode colar direto um
        link do Google Maps aqui.
      </span>
    </div>
  );
}
