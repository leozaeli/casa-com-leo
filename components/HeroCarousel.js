export default function HeroCarousel({ fotos }) {
  const capa = fotos[0];

  return (
    <div className="hero-carousel">
      <div className="hero-carousel-slide" style={{ backgroundImage: `url('${capa}')` }} />
      <div className="hero-carousel-scrim" />
    </div>
  );
}
