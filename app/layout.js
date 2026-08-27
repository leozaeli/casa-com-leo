export const metadata = {
  title: 'Casa com Leo — Imóveis com intenção',
  description: 'Casa com Leo — imóveis extraordinários para uma vida com mais intenção.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        {children}
        <script src="/script.js" defer></script>
      </body>
    </html>
  );
}
