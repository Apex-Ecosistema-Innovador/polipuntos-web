import type { Metadata, Viewport } from 'next';
import { Chakra_Petch, Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/features/auth/auth-context';
import { ConnectivityProvider } from '@/features/offline/connectivity-context';
import { ServiceWorkerBoot } from '@/features/offline/service-worker-boot';
import '@/styles/globals.scss';

const display = Chakra_Petch({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Polipuntos | APEX',
  description: 'Registro y seguimiento de polipuntos del modelo APEX.',
  applicationName: 'APEX Polipuntos',
  appleWebApp: { capable: true, title: 'Polipuntos', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#08090a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ConnectivityProvider>
          <AuthProvider>{children}</AuthProvider>
          <ServiceWorkerBoot />
        </ConnectivityProvider>
      </body>
    </html>
  );
}
