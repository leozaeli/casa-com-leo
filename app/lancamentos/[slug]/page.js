import { notFound } from 'next/navigation';
import LaunchPropertyPage from '@/components/LaunchPropertyPage';
import { getImovelBySlug } from '@/lib/imoveis';
import '../launch.css';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (slug !== 'mont-blanc-hill') return {};
  return { title: 'Mont Blanc Hill — Lançamentos | Casa com Leo', description: 'Lançamento no Caminho das Árvores, Salvador.' };
}

export default async function LancamentoPage({ params }) {
  const { slug } = await params;
  if (slug !== 'mont-blanc-hill') notFound();
  const imovel = await getImovelBySlug(slug);
  if (!imovel) notFound();
  return <LaunchPropertyPage imovel={imovel} />;
}
