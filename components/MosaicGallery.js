'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function MosaicGallery({ fotos, alt }) {
  const [openIndex, setOpenIndex] = useState(null);
  const touchStartX = useRef(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length)),
    [fotos.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % fotos.length)),
    [fotos.length]
  );

  useEffect(() => {
    if (openIndex === null) return undefined;
    function handleKey(event) {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'ArrowRight') next();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [openIndex, close, prev, next]);

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    event.preventDefault();
    if (delta < 0) next();
    else prev();
  }

  return (
    <>
      <div className="mosaic-gallery">
        {fotos.map((foto, index) => (
          <button key={foto} type="button" className="mosaic-item" onClick={() => setOpenIndex(index)}>
            <img src={foto} alt={`${alt} — foto ${index + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div className="lightbox" onClick={close} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <button type="button" className="lightbox-close" onClick={close} aria-label="Fechar">
            ✕
          </button>
          {fotos.length > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-prev"
              onClick={(event) => {
                event.stopPropagation();
                prev();
              }}
              aria-label="Foto anterior"
            >
              ‹
            </button>
          )}
          <img
            className="lightbox-image"
            src={fotos[openIndex]}
            alt={`${alt} — foto ${openIndex + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
          {fotos.length > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-next"
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              aria-label="Próxima foto"
            >
              ›
            </button>
          )}
          <span className="lightbox-counter">
            {openIndex + 1} / {fotos.length}
          </span>
        </div>
      )}
    </>
  );
}
