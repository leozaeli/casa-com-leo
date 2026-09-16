import Nav from '@/components/Nav';
import { SimpleFooter } from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ExperienceIcon from '@/components/ExperienceIcon';
import MosaicGallery from '@/components/MosaicGallery';
import HomeMotion from '@/components/HomeMotion';
import { resolveMapEmbed } from '@/lib/imoveis';

const LEISURE = [
  ['Lazer aquático', 'Piscina com raia e borda infinita · Piscina infantil · Deck molhado · Quiosque'],
  ['Social', 'Espaço gourmet · Salão de festas · Game room'],
  ['Bem-estar & esporte', 'Academia · Quadra de squash · Quadra de futebol · Espaço Zen'],
  ['Família', 'Espaço kids · Parque infantil · Pet space'],
  ['Conveniência', 'Office · Bicicletário · 2 elevadores sociais e 1 de serviço'],
];

const TECHNICAL = [
  ['Tipo', 'Residencial multifamiliar de alto padrão'],
  ['Status', 'Obras avançadas'],
  ['Incorporação', 'Azinunes Construções & Incorporações · SPE RPMEL Cam das Árvores'],
  ['Engenharia', 'BETA Engenharia'],
  ['Arquitetura', 'Gustavo Siqueira Valença · Valença & Valença'],
  ['Responsável técnico', 'Pedro Neves Azi · CREA/BA 40975'],
  ['Metragens', '133,81 m² (tipo, 4 plantas) · 261,92 m² (cobertura duplex)'],
  ['Vagas', '2 vagas (tipo) · 4 vagas (duplex) · vagas para visitantes'],
  ['Orientação', 'Nascente total'],
  ['Alvará', 'Licença de Construção nº 24367 · 30.11.2023'],
  ['Matrícula', 'nº 72.644 · 6º Ofício de Registro de Imóveis de Salvador/BA'],
];

const AROUND = [
  ['Compras', 'Shopping da Bahia · Shopping Itaigara · Salvador Shopping'],
  ['Educação', 'Pindorama Vila Mirim · Escola Tempo de Crescer · Colégio Bernoulli'],
  ['Conveniência', 'Total Supermercados · Hiperideal'],
  ['Gastronomia', 'Coco Bambu'],
  ['Mobilidade', 'Centro de Convenções · Terminal Rodoviário · Praia de Armação / Costa Azul'],
];

export default async function LaunchPropertyPage({ imovel }) {
  const fotos = imovel.fotos || [];
  const plantas = fotos.filter((foto) => /planta-tipo-\d/.test(foto));
  const fotosDaGaleria = fotos.filter((foto) => !/planta-tipo-\d/.test(foto));
  const map = await resolveMapEmbed(imovel.mapa_url);
  const hero = fotos[0];
  const cardPhoto = (index) => fotos[index] || hero;

  return (
    <div className="launch-page site-identity">
      <HomeMotion />
      <Nav active="lancamentos" />
      <main>
        <section className="launch-hero">
          <img src={hero} alt="Fachada do Mont Blanc Hill" fetchPriority="high" />
          <div className="launch-hero-shade" />
          <div className="wrap launch-hero-top"><a href="/lancamentos"><ExperienceIcon direction="left" /> Lançamentos</a><span>CAMINHO DAS ÁRVORES · SALVADOR</span></div>
          <div className="wrap launch-hero-content">
            <span className="launch-label">Lançamento · Obras avançadas</span>
            <h1>Mont Blanc<br /><em>Hill.</em></h1>
            <p>Na Alameda dos Sombreiros, uma nova forma de viver o Caminho das Árvores.</p>
            <div className="launch-hero-actions"><a href="#projeto" className="experience-button">Explorar o projeto <ExperienceIcon /></a><button className="button" type="button" data-popup="interesse" data-property="Mont Blanc Hill" data-modalities="venda">Quero conhecer <ExperienceIcon /></button></div>
          </div>
        </section>

        <nav className="launch-anchor-nav" aria-label="Navegação do lançamento"><div className="wrap"><a href="#projeto">Projeto</a><a href="#residencias">Residências</a><a href="#lazer">Lazer</a><a href="#localizacao">Localização</a><a href="#galeria">Galeria</a><a href="#obra">Obra</a></div></nav>

        <section className="launch-intro" id="projeto"><div className="wrap">
          <span className="launch-kicker">01 / SIMPLESMENTE EXUBERANTE</span>
          <div className="launch-intro-grid"><h2>Um novo marco<br /><em>para a cidade.</em></h2><p>Sofisticação, conforto e qualidade de vida em um projeto moderno e completo. Uma torre de presença contemporânea, desenhada para acolher luz, ventilação e uma rotina com mais espaço.</p></div>
          <div className="launch-numbers"><div><strong>133,81</strong><span>m² privativos</span></div><div><strong>3</strong><span>suítes</span></div><div><strong>2</strong><span>vagas</span></div><div><strong>100%</strong><span>nascente</span></div><div><strong>21</strong><span>itens de lazer e conveniência</span></div></div>
        </div></section>

        <section className="launch-statements"><div className="wrap">
          <article><div><span>01</span><h3>Uma torre que se destaca no skyline.</h3><p>Varandas verdejantes em toda a extensão da fachada e orientação nascente total para aproveitar melhor a luz e a ventilação.</p></div><img src={cardPhoto(1)} alt="Vista aérea do Mont Blanc Hill" /></article>
          <article><div><span>02</span><h3>Chegada com assinatura.</h3><p>Portaria, acesso e paisagismo pensados como o primeiro gesto de acolhimento para quem chega.</p></div><img src={cardPhoto(2)} alt="Acesso do Mont Blanc Hill" /></article>
          <article><div><span>03</span><h3>Detalhes que sustentam a experiência.</h3><p>Arquitetura e interiores de Valença & Valença, engenharia BETA e incorporação Azinunes.</p></div><img src={cardPhoto(3)} alt="Detalhe do empreendimento Mont Blanc Hill" /></article>
        </div></section>

        <section className="launch-residences" id="residencias"><div className="wrap launch-two-column"><div><span className="launch-kicker">02 / RESIDÊNCIAS</span><h2>Plantas amplas,<br /><em>versáteis e nascentes.</em></h2><p>Uma planta tipo de 133,81 m² que permite morar com conforto hoje e continuar fazendo sentido ao longo do tempo.</p></div><div className="launch-plan"><span>APARTAMENTO TIPO</span><strong>133,81 m²</strong><p>3 suítes · 2 vagas · nascente total</p><ul><li>Suítes com varanda gourmet</li><li>Home office ou dependência</li><li>Living amplo integrado</li><li>Cozinha e área de serviço</li><li>Lavabo social</li></ul><small>Cobertura duplex de 261,92 m² · esgotada</small></div></div>{plantas.length > 0 && <div className="wrap launch-plan-gallery"><div className="launch-plan-gallery-intro"><span>Conheça as plantas</span></div><MosaicGallery fotos={plantas} alt="Planta tipo do Mont Blanc Hill" refined /></div>}</section>

        <section className="launch-leisure" id="lazer"><div className="wrap"><span className="launch-kicker">03 / LAZER & DIFERENCIAIS</span><div className="launch-leisure-head"><h2>Infraestrutura para<br /><em>o tempo que importa.</em></h2><p>Ambientes de encontro, movimento e pausa — para os dias que pedem companhia ou silêncio.</p></div><div className="launch-leisure-images"><figure><img src={cardPhoto(7)} alt="Piscina de borda infinita" /><figcaption><span>Lazer aquático</span>Piscina com borda infinita</figcaption></figure><figure><img src={cardPhoto(9)} alt="Espaço gourmet" /><figcaption><span>Social</span>Espaço gourmet</figcaption></figure><figure><img src={cardPhoto(11)} alt="Game room" /><figcaption><span>Convivência</span>Game room</figcaption></figure></div><div className="launch-leisure-list">{LEISURE.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

        <section className="launch-location" id="localizacao"><div className="wrap launch-location-grid"><div><span className="launch-kicker">04 / LOCALIZAÇÃO</span><h2>No coração do<br /><em>Caminho das Árvores.</em></h2><p>Alameda dos Sombreiros, 476. Uma rua arborizada, elegante e próxima do que faz parte da rotina: shoppings, escolas, restaurantes e centros empresariais.</p><div className="launch-around">{AROUND.map(([title, text]) => <div key={title}><b>{title}</b><span>{text}</span></div>)}</div></div>{map && <iframe src={map.embedSrc} title="Mapa do Mont Blanc Hill" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}</div></section>

        <section className="launch-gallery" id="galeria"><div className="wrap"><div className="launch-section-heading"><span className="launch-kicker">05 / GALERIA</span><h2>Perspectivas<br /><em>do projeto.</em></h2><p>Fachada, interiores e áreas de lazer para explorar no seu ritmo.</p></div><MosaicGallery fotos={fotosDaGaleria} alt="Mont Blanc Hill" refined /></div></section>

        <section className="launch-work" id="obra"><div className="wrap"><span className="launch-kicker">06 / ACOMPANHAMENTO DA OBRA</span><div className="launch-work-grid"><div><h2>Um projeto<br /><em>em movimento.</em></h2><p>Obras avançadas, com atualizações recentes de torre, fachadas, entorno e acabamentos internos.</p><button className="button" type="button" data-popup="interesse" data-property="Mont Blanc Hill" data-modalities="venda">Receber novidades <ExperienceIcon /></button></div><ol><li><span>01</span><div><b>26.08.2026</b><p>Vistas aéreas da torre, fachadas laterais e entorno.</p></div></li><li><span>02</span><div><b>24.08.2026</b><p>Fachada oeste, varandas e diferentes ângulos da torre.</p></div></li><li><span>03</span><div><b>20.08.2026</b><p>Ambientes internos, alvenaria, instalações e acabamentos.</p></div></li><li><span>04</span><div><b>31.07.2026</b><p>Revestimentos e serviços nos ambientes internos.</p></div></li></ol></div></div></section>

        <section className="launch-technical"><div className="wrap"><span className="launch-kicker">FICHA TÉCNICA</span><div className="launch-tech-grid">{TECHNICAL.map(([label, value]) => <div key={label}><span>{label}</span><p>{value}</p></div>)}</div></div></section>

        <section className="launch-cta"><div className="wrap"><div><span>CASA COM LEO / LANÇAMENTOS</span><h2>Vamos conversar<br />sobre esse começo?</h2></div><button className="button" type="button" data-popup="interesse" data-property="Mont Blanc Hill" data-modalities="venda">Quero saber mais <ExperienceIcon /></button></div></section>
      </main>
      <SimpleFooter />
      <WhatsAppFloat minimalOnMobile />
    </div>
  );
}
