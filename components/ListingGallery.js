'use client';

import { useState } from 'react';

const MAX_LISTING_PHOTOS = 5;

export default function ListingGallery({ photos, title, href }) {
  const galleryPhotos = (photos || []).slice(0, MAX_LISTING_PHOTOS);
  const hasMorePhotos = (photos || []).length > MAX_LISTING_PHOTOS;
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const slidesCount = galleryPhotos.length + (hasMorePhotos ? 1 : 0);

  function goToSlide(nextSlide) {
    setActiveSlide((nextSlide + slidesCount) % slidesCount);
  }

  function handleTouchEnd(event) {
    if (touchStart === null) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 36) goToSlide(activeSlide + (distance < 0 ? 1 : -1));
    setTouchStart(null);
  }

  return (
    <div
      className="listing-gallery"
      aria-label={`Fotos de ${title}`}
      onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
    >
      <div className="listing-gallery-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
        {galleryPhotos.map((photo, index) => (
          <img key={photo} src={photo} alt={index === 0 ? title : `${title} — foto ${index + 1}`} />
        ))}
        {hasMorePhotos && (
          <a className="listing-gallery-more" href={href} aria-label={`Ver todas as fotos de ${title}`}>
            <span>VER MAIS</span>
            <small>Ver imóvel completo</small>
          </a>
        )}
      </div>
      {slidesCount > 1 && (
        <>
          <button className="listing-gallery-nav listing-gallery-prev" type="button" onClick={() => goToSlide(activeSlide - 1)} aria-label="Foto anterior">←</button>
          <button className="listing-gallery-nav listing-gallery-next" type="button" onClick={() => goToSlide(activeSlide + 1)} aria-label="Próxima foto">→</button>
          <div className="listing-gallery-count" aria-live="polite">
            {activeSlide < galleryPhotos.length ? `${activeSlide + 1} / ${galleryPhotos.length}` : 'Ver mais'}
          </div>
        </>
      )}
    </div>
  );
}
