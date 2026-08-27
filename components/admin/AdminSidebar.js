'use client';

import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/admin/LogoutButton';

const SITE_URL = 'https://www.casacomleo.com.br';

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

const GROUPS = [
  {
    label: 'Imóveis',
    links: [
      { href: '/', label: 'Imóveis', exact: true, icon: HomeIcon },
      { href: '/novo', label: 'Novo imóvel', exact: false, icon: PlusIcon },
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
        <a href={`${SITE_URL}/imoveis`} target="_blank" rel="noreferrer" className="admin-view-site">
          Ver site ↗
        </a>
        <LogoutButton />
      </div>
    </aside>
  );
}
