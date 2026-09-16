import { headers } from 'next/headers';
import Analytics from '@/components/Analytics';
import './responsive.css';
import './identity.css';
import './dialog.css';

export const metadata = {
  title: 'Casa com Leo — Imóveis com intenção',
  description: 'Casa com Leo — imóveis extraordinários para uma vida com mais intenção.',
};

export default async function RootLayout({ children }) {
  const hdrs = await headers();
  const isAdminHost = (hdrs.get('host') || '').startsWith('admin.');

  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="/styles.css?v=20260915-launch-contrast" />
      </head>
      <body>
        {children}
        {!isAdminHost && <Analytics />}
        <script src="/script.js" defer></script>
      </body>
    </html>
  );
}
