'use client';

import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/admin/LogoutButton';

const SITE_URL = 'https://www.casacomleo.com.br';

const DashboardIcon = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
const HomeIcon = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 21V9l8-5 8 5v12" />
    <path d="M9 21v-6h6v6M4 21h16" />
  </svg>
);
const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const StudioIcon = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 14h16" />
  </svg>
);
const LeadsIcon = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 21c1.5-4 4-6 7-6s5.5 2 7 6" />
  </svg>
);
const LocationIcon = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

const GROUPS = [
  {
    label: 'Geral',
    links: [
      { href: '/', label: 'Dashboard', exact: true, icon: DashboardIcon },
      { href: '/leads', label: 'Leads', exact: false, icon: LeadsIcon },
    ],
  },
  {
    label: 'Imóveis',
    links: [
      { href: '/imoveis', label: 'Imóveis', exact: true, icon: HomeIcon },
      { href: '/imoveis/novo', label: 'Novo imóvel', exact: false, icon: PlusIcon },
      { href: '/imoveis/localizacoes', label: 'Localizações', exact: false, icon: LocationIcon },
    ],
  },
  {
    label: 'Studios',
    links: [
      { href: '/studios', label: 'Studios', exact: true, icon: StudioIcon },
      { href: '/studios/novo', label: 'Novo studio', exact: false, icon: PlusIcon },
    ],
  },
];

export default function AdminSidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname.startsWith('/admin') ? rawPathname.slice('/admin'.length) || '/' : rawPathname;

  return (
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/">
        <span className="admin-brand-mark">L</span>
        <span>
          Casa com Leo
          <small>Admin</small>
        </span>
      </a>
      <a href={SITE_URL} target="_blank" rel="noreferrer" className="admin-goto-site">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 5h5v5M19 5l-9 9M6 5H5v14h14v-1" />
        </svg>
        Ir para o site
      </a>
      <div className="admin-nav-groups">
        {GROUPS.map((group) => (
          <div className="admin-nav-group" key={group.label}>
            <span className="admin-nav-group-label">{group.label}</span>
            <div className="admin-nav" role="navigation" aria-label={group.label}>
              {group.links.map((link) => {
                const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <a key={link.href} href={link.href} className={active ? 'active' : undefined}>
                    {link.icon}
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="admin-sidebar-footer">
        <LogoutButton />
      </div>
    </aside>
  );
}
