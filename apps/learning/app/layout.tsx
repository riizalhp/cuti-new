import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  title: {
    default: 'Employr Learning — Career Courses & Digital Certification',
    template: '%s | Employr Learning',
  },
  description:
    'Tingkatkan keterampilan kerja dan raih sertifikat profesional terverifikasi dari universitas dan perusahaan global.',
  applicationName: 'Employr Learning',
  keywords: [
    'Employr Learning',
    'Kursus Online',
    'Sertifikasi Digital',
    'Karier Indonesia',
    'Pelatihan Kerja',
    'Upskilling',
  ],
  authors: [{ name: 'Employr Team' }],
  creator: 'Employr',
  publisher: 'Employr Indonesia',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full min-h-full bg-background text-foreground antialiased selection:bg-cobalt-500 selection:text-white font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
