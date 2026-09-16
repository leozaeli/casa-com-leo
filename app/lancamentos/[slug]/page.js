import { notFound } from 'next/navigation';
import LaunchPropertyPage from '@/components/LaunchPropertyPage';
import { getImovelBySlug } from '@/lib/imoveis';
import { getLaunchBrief } from '@/lib/launch-admin';
import GenericLaunchPage from '@/components/GenericLaunchPage';
import '../launch.css';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (slug !== 'mont-blanc-hill') {
    const launch = await getLaunchBrief(slug);
    return launch ? { title: `${launch.title} | Casa com Leo`, description: launch.description || 'Lançamento Casa com Leo.' } : {};
  }
  return { title: 'Mont Blanc Hill — Lançamentos | Casa com Leo', description: 'Lançamento no Caminho das Árvores, Salvador.' };
}

export default async function LancamentoPage({ params }) {
  const { slug } = await params;
  if (slug !== 'mont-blanc-hill') {
    const launch = await getLaunchBrief(slug);
    if (!launch || launch.status !== 'published') notFound();
    const imovel = launch.property_slug ? await getImovelBySlug(launch.property_slug) : null;
    return <GenericLaunchPage launch={launch} property={imovel} />;
  }
  const imovel = await getImovelBySlug(slug);
  if (!imovel) notFound();
  return <LaunchPropertyPage imovel={imovel} />;
}
