import { sitePath } from '@/lib/site-path';
import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: "mos’so — Modern Original Style ' Stand Out",
  description: 'mos’so kadın giyim koleksiyonu. Günlük stilinden özel anlarına, kendin gibi giyin.',
  robots: { index: false, follow: false },
  icons: { icon: sitePath('/favicon.svg') },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
