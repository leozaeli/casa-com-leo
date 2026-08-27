import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/admin/LogoutButton';

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = Boolean(user && user.email === process.env.ADMIN_EMAIL);

  if (!isAdmin) {
    redirect('/admin/login');
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a className="admin-brand" href="/admin">
          Casa com Leo · Admin
        </a>
        <nav className="admin-nav">
          <a href="/admin">Imóveis</a>
          <a href="/admin/novo">+ Novo imóvel</a>
          <LogoutButton />
        </nav>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
