import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { DemoBanner } from '@/components/DemoBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cafecito | Menú Digital — Tuxpanguillo, Veracruz',
  description:
    'Cafecito en Tuxpanguillo, Ixtaczoquitlan, Veracruz. Explora nuestro menú digital, arma tu pedido y envíalo por WhatsApp. Crepas, wafles, marquesitas, frappés, bubble tea, alitas y más.',
  keywords: [
    'cafetería',
    'Cafecito',
    'Tuxpanguillo',
    'Ixtaczoquitlan',
    'Veracruz',
    'menú digital',
    'pedidos por WhatsApp',
    'crepas',
    'wafles',
    'marquesitas',
    'frappés',
    'bubble tea',
    'alitas',
    'café de especialidad',
    'cafetería Veracruz',
  ],
  authors: [{ name: 'Cafecito' }],
  creator: 'Cafecito',
  openGraph: {
    title: 'Cafecito | Menú Digital — Tuxpanguillo, Veracruz',
    description:
      'Cafecito en Tuxpanguillo, Ixtaczoquitlan, Veracruz. Crepas, wafles, marquesitas, frappés, bubble tea y más. Arma tu pedido y envíalo por WhatsApp.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Cafecito',
  },
  twitter: {
    card: 'summary',
    title: 'Cafecito | Menú Digital — Tuxpanguillo, Veracruz',
    description:
      'Crepas, wafles, marquesitas, frappés y más en Tuxpanguillo, Veracruz. Pide por WhatsApp.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: config } = await supabase
    .from('configuracion')
    .select('color_primario')
    .limit(1)
    .single();

  const colorPrimario = config?.color_primario ?? '#B35D33';

  return (
    <html lang="es-MX">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
        style={{ '--color-primario': colorPrimario } as React.CSSProperties}
      >
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
