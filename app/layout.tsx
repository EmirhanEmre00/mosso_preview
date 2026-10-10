import { sitePath } from '@/lib/site-path';
import type { Metadata } from 'next';
import FocusBehavior from '@/components/focus-behavior';
import './globals.css';
import './preview-theme.css';
export const metadata: Metadata = {
  title: "mos’so — Modern Original Style ' Stand Out",
  description: 'mos’so kadın giyim koleksiyonu. Günlük stilinden özel anlarına, kendin gibi giyin.',
  robots: { index: false, follow: false },
  icons: { icon: { url: sitePath('/favicon.png?v=6'), type: 'image/png', sizes: '64x64' } },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>
        <FocusBehavior />
        {children}
      </body>
    </html>
  );
}
