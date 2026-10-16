import { sitePath } from '@/lib/site-path';
import type { Metadata } from 'next';
import FocusBehavior from '@/components/focus-behavior';
import './globals.css';
import './preview-theme.css';
export const metadata: Metadata = {
  title: "mos’so — Modern Original Style ' Stand Out",
  description: 'mos’so kadın giyim koleksiyonu. Günlük stilinden özel anlarına, kendin gibi giyin.',
  robots: { index: false, follow: false },
  icons: {
    icon: {
      url: sitePath('/images/ms-favicon-original-outer-corners.png'),
      type: 'image/png',
      sizes: '1254x1254',
    },
  },
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
