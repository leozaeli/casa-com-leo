import Nav from '@/components/Nav';
import { SimpleFooter } from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { getImovelBySlug } from '@/lib/imoveis';
import { getLaunchUrl } from '@/lib/launches';
import { listLaunchBriefs } from '@/lib/launch-admin';
import './launch.css';

export const revalidate = 0;

export const metadata = {
  title: 'Lançamentos — Casa com Leo',
  description: 'Lançamentos selecionados para viver Salvador com intenção.',
};

export default async function LancamentosPage() {
  const montBlanc = await getImovelBySlug('mont-blanc-hill');
  const launches = (await listLaunchBriefs()).filter((launch) => launch.status === 'published');
  const cards = launches.map((launch) => ({
    title: launch.title,
    href: getLaunchUrl(launch.property_slug || launch.subdomain),
    image: launch.subdomain === 'reservadosol' ? 'https://azinunes.com.br/empreendimentos/reserva-do-sol/rds/hero-piscina-fachada.webp' : montBlanc?.fotos?.[0],
    eyebrow: launch.location ? `Lançamento · ${launch.location}` : 'Lançamento',
    summary: launch.highlights || launch.description || 'Conheça o empreendimento.',
  }));

  return (
    <div className="launch-page launch-index site-identity">
      <Nav active="lancamentos" />
      <main>
        <section className="launch-index-hero">
          <div className="wrap">
            <span className="launch-kicker">CASA COM LEO / LANÇAMENTOS</span>
            <h1>O que está<br /><em>começando agora.</em></h1>
            <p>Projetos que merecem atenção antes de virarem endereço.</p>
          </div>
        </section>
        <section className="launch-index-list">
          <div className="wrap">
            {cards.map((launch) => <a className="launch-index-card" href={launch.href} key={launch.href}><img src={launch.image} alt={launch.title} /><div><span>{launch.eyebrow}</span><h2>{launch.title}</h2><p>{launch.summary}</p></div><b>Conhecer <span>→</span></b></a>)}
          </div>
        </section>
      </main>
      <SimpleFooter />
      <WhatsAppFloat minimalOnMobile />
    </div>
  );
}
