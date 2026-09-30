import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Support Center | POLARIS — NCPOR Indian Antarctic Operations',
  description:
    'Support Center for Maitri, Bharati, and NCPOR Goa operations. People. Systems. Always Connected.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f4f6f9] text-slate-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
