'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [-12.9718, -38.5011]; // Salvador, Bahia
const DEFAULT_ZOOM = 11;
const PIN_ZOOM = 15;

function parseValue(raw) {
  const trimmed = (raw || '').toString();
  const [address, coords] = trimmed.split('|');
  const coordMatch = coords && coords.trim().match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
  return {
    address: address || '',
    lat: coordMatch ? Number(coordMatch[1]) : null,
    lon: coordMatch ? Number(coordMatch[2]) : null,
  };
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=0`
    );
    const data = await res.json();
    return data?.display_name || null;
  } catch {
    return null;
  }
}

export default function LocationPicker({ defaultValue }) {
  const initial = parseValue(defaultValue);
  const [query, setQuery] = useState(initial.address);
  const [coords, setCoords] = useState(initial.lat != null ? { lat: initial.lat, lon: initial.lon } : null);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);

  const debounceRef = useRef(null);
  const boxRef = useRef(null);
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  async function placePoint(lat, lon, { skipReverseGeocode = false } = {}) {
    setCoords({ lat, lon });
    const map = mapRef.current;
    if (map) {
      map.setView([lat, lon], Math.max(map.getZoom(), PIN_ZOOM));
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      } else {
        markerRef.current = L.marker([lat, lon], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          placePoint(pos.lat, pos.lng);
        });
      }
    }
    if (!skipReverseGeocode) {
      setResolvingAddress(true);
      const address = await reverseGeocode(lat, lon);
      setResolvingAddress(false);
      if (address) setQuery(address);
    }
  }

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const start = coords ? [coords.lat, coords.lon] : DEFAULT_CENTER;
    const map = L.map(mapElRef.current).setView(start, coords ? PIN_ZOOM : DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; contribuidores do OpenStreetMap',
    }).addTo(map);

    if (coords) {
      markerRef.current = L.marker(start, { draggable: true }).addTo(map);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        placePoint(pos.lat, pos.lng);
      });
    }

    map.on('click', (event) => placePoint(event.latlng.lat, event.latlng.lng));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setSuggestions([]);
    setOpen(false);
    placePoint(Number(item.lat), Number(item.lon), { skipReverseGeocode: true });
  }

  const hiddenValue = query.trim()
    ? coords
      ? `${query}|${coords.lat.toFixed(6)},${coords.lon.toFixed(6)}`
      : query
    : '';

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
      {(loading || resolvingAddress) && (
        <span className="admin-hint">{resolvingAddress ? 'Buscando o endereço desse ponto…' : 'Buscando endereços…'}</span>
      )}
      <div className="location-picker-map" ref={mapElRef} />
      <span className="admin-hint">
        Escolha uma sugestão da lista ou clique direto no mapa para fixar o ponto — o endereço é preenchido
        automaticamente. Também dá pra arrastar o pino.
      </span>
    </div>
  );
}
