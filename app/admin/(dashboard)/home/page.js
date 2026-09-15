import HomeHeroForm from '@/components/admin/HomeHeroForm';
import { getHomeHero } from '@/lib/home-hero';

export const metadata = { title: 'Home — Admin Casa com Leo' };
export default async function HomeAdminPage() { const hero = await getHomeHero(); return <><div className="admin-page-head"><div><span className="admin-eyebrow">Site</span><h1>Home</h1><p className="admin-page-subtitle">Edite a abertura e as imagens da primeira sessão.</p></div></div><HomeHeroForm hero={hero} /></>; }
