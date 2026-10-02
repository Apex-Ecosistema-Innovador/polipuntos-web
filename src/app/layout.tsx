import type { Metadata, Viewport } from 'next';
import { Chakra_Petch, Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/features/auth/auth-context';
import '@/styles/globals.scss';

const display = Chakra_Petch({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Polipuntos | APEX',
  description: 'Registro y seguimiento de polipuntos del modelo APEX.',
};

export const viewport: Viewport = {
  themeColor: '#08090a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
