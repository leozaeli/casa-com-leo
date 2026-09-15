'use client';

import { useEffect } from 'react';

export default function HomeMotion() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    const elements = document.querySelectorAll('.casa-experience .section-head, .casa-experience .property-card, .casa-experience .benefit-card, .casa-experience .format-banner-card, .casa-experience .statement .wrap, .casa-experience .contact-grid, .property-experience .detail-intro, .property-experience .specs, .property-experience .location-info');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('experience-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => {
      element.classList.add('experience-reveal');
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove('experience-reveal', 'experience-visible'));
    };
  }, []);
  return null;
}
