export const metadata = {
  title: 'Admin — Casa com Leo',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/admin.css" />
      {children}
    </>
  );
}
