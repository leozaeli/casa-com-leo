'use client';

import { useEffect, useState } from 'react';

export default function HeroCarousel({ fotos }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (fotos.length <= 1) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % fotos.length), 4500);
    return () => clearInterval(id);
  }, [fotos.length]);

  return (
    <>
      <div className="hero-carousel">
        <div className="hero-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {fotos.map((foto) => (
            <div key={foto} className="hero-carousel-slide" style={{ backgroundImage: `url('${foto}')` }} />
          ))}
        </div>
        <div className="hero-carousel-scrim" />
      </div>
      {fotos.length > 1 && (
        <div className="hero-carousel-dots">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              type="button"
              className={i === index ? 'active' : ''}
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </>
  );
}
