'use client';

import { useEffect, useRef } from 'react';
import ExperienceIcon from '@/components/ExperienceIcon';

const scenes = [
  { photo: 'photo-1600596542815-ffad4c1539a9', alt: 'Arquitetura contemporânea com jardim e piscina', label: 'Arquitetura que inspira' },
  { photo: 'photo-1600607687920-4e2a09cf159d', alt: 'Sala ampla com luz natural e integração dos ambientes', label: 'Espaço para viver' },
  { photo: 'photo-1600607688969-a5bfcd646154', alt: 'Interior contemporâneo aberto para a paisagem', label: 'Um novo olhar' },
];

export default function ImmersiveHero() {
  const root = useRef(null);

  useEffect(() => {
    const element = root.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const progress = preference.matches ? 0 : clamp(-bounds.top / Math.max(1, bounds.height - window.innerHeight));
      element.style.setProperty('--journey', progress);
      element.style.setProperty('--zoom', 1 + progress * 0.14);
      element.style.setProperty('--intro-opacity', 1 - clamp(progress / 0.3));
      element.style.setProperty('--intro-y', `${progress * -110}px`);
      element.style.setProperty('--scene-two', clamp((progress - 0.22) / 0.22));
      element.style.setProperty('--scene-three', clamp((progress - 0.62) / 0.22));
      element.style.setProperty('--chapter-two', clamp((progress - 0.3) / 0.13) * (1 - clamp((progress - 0.58) / 0.1)));
      element.style.setProperty('--chapter-three', clamp((progress - 0.73) / 0.15));
      element.dataset.chapter = progress < 0.34 ? '1' : progress < 0.74 ? '2' : '3';
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <section className="immersive-journey" id="inicio" ref={root} aria-label="Explore um novo jeito de morar">
      <div className="immersive-stage">
        <div className="journey-images" aria-hidden="true">
          {scenes.map((scene, index) => (
            <img key={scene.photo} className={`journey-image journey-image-${index + 1}`}
              src={`https://images.unsplash.com/${scene.photo}?auto=format&fit=crop&w=1920&q=85`}
              srcSet={[640, 1080, 1920].map((width) => `https://images.unsplash.com/${scene.photo}?auto=format&fit=crop&w=${width}&q=85 ${width}w`).join(', ')}
              sizes="100vw" alt={scene.alt} fetchPriority={index === 0 ? 'high' : 'low'} decoding="async" />
          ))}
        </div>
        <div className="journey-shade" />
        <div className="journey-orbit" aria-hidden="true"><span /><span /></div>
        <div className="journey-coordinate" aria-hidden="true">12°58′ S &nbsp; 38°30′ W <span>BAHIA, BRASIL</span></div>
        <div className="journey-intro">
          <p className="experience-kicker"><span className="signal-dot" /> SALVADOR & LITORAL NORTE</p>
          <h1><span className="title-mask"><span>Seu próximo</span></span><span className="title-mask"><span>capítulo<span className="lime-period">.</span></span></span></h1>
          <div className="journey-intro-bottom"><p>Casas que surpreendem.<br />Escolhas que fazem sentido.</p><a href="#busca" className="experience-button">Encontre seu lugar <span><ExperienceIcon /></span></a></div>
        </div>
        <div className="journey-chapter chapter-two" aria-hidden="true"><span className="experience-kicker">02 / SINTA O ESPAÇO</span><p>A vida pede<br /><em>mais espaço.</em></p></div>
        <div className="journey-chapter chapter-three" aria-hidden="true"><span className="experience-kicker">03 / IMAGINE O PRÓXIMO CAPÍTULO</span><p>O seu lugar.<br /><em>Do seu jeito.</em></p></div>
        <div className="journey-bottom"><a href="#busca" className="scroll-invitation"><span><ExperienceIcon direction="down" /></span> ROLE PARA EXPLORAR</a><div className="journey-index" aria-hidden="true">{scenes.map((scene, index) => <span key={scene.photo} className={`journey-step step-${index + 1}`}><b>0{index + 1}</b><span>{scene.label}</span></span>)}</div><span className="journey-photo-note">Imagens de inspiração</span></div>
        <div className="journey-progress" aria-hidden="true" />
      </div>
    </section>
  );
}
