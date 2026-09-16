import Nav from '@/components/Nav';
import { SimpleFooter } from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { getImovelBySlug } from '@/lib/imoveis';
import { getLaunchUrl } from '@/lib/launches';
import './launch.css';

export const revalidate = 0;

export const metadata = {
  title: 'Lançamentos — Casa com Leo',
  description: 'Lançamentos selecionados para viver Salvador com intenção.',
};

export default async function LancamentosPage() {
  const montBlanc = await getImovelBySlug('mont-blanc-hill');

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
            {montBlanc && (
              <a className="launch-index-card" href={getLaunchUrl(montBlanc.slug)}>
                <img src={montBlanc.fotos?.[0]} alt="Mont Blanc Hill" />
                <div><span>Lançamento · Caminho das Árvores</span><h2>Mont Blanc Hill</h2><p>133,81 m² · 3 suítes · Sob consulta</p></div>
                <b>Conhecer <span>→</span></b>
              </a>
            )}
          </div>
        </section>
      </main>
      <SimpleFooter />
      <WhatsAppFloat minimalOnMobile />
    </div>
  );
}
