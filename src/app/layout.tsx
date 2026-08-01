import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '../context/AppContext';
import { AppShell } from '../components/layout/AppShell';

export const metadata: Metadata = {
  title: 'PoultryCockpit - Commercial Broiler Management',
  description:
    'Commercial broiler poultry farm management application digitizing batch lifecycles, daily operations, liftings, financials, settlements, and audit logs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#f7f9f6] text-slate-800 antialiased overflow-x-hidden min-h-screen">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
