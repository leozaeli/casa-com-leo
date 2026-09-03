export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ModeloLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/modelo.css" />
      {children}
    </>
  );
}
