import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NAKSH369® — Your Personal Blueprint Platform',
  description: 'Your birth chart decoded into a living manual — through verified Vedic charts, KP system, and the NAKSH Activation Framework™.',
  keywords: 'astrology, numerology, life path, vedic astrology, blueprint, naksh369',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
