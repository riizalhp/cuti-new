import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Employr — Career Operating System & CV ATS',
    template: '%s | Employr',
  },
  description:
    'Platform karier terpadu untuk talenta muda Indonesia: buat CV ATS, pantau lamaran kerja di Kanban Tracker, analisis kesiapan kerja, dan raih karier impian bersama Employr.',
  applicationName: 'Employr',
  keywords: [
    'Employr',
    'CV ATS',
    'Career Operating System',
    'Job Tracker',
    'Lamaran Kerja',
    'Loker Indonesia',
    'Fresh Graduate',
    'Simulasi Interview',
  ],
  authors: [{ name: 'Employr Team' }],
  creator: 'Employr',
  publisher: 'Employr Indonesia',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://app.employr.id'),
  openGraph: {
    title: 'Employr — Career Operating System & CV ATS',
    description:
      'Platform karier terpadu untuk talenta muda Indonesia: buat CV ATS, pantau lamaran, analisis kesiapan kerja, dan raih karier impian bersama Employr.',
    url: 'https://app.employr.id',
    siteName: 'Employr',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/logo.webp',
        width: 800,
        height: 600,
        alt: 'Employr Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employr — Career Operating System & CV ATS',
    description:
      'Platform karier terpadu untuk talenta muda Indonesia: buat CV ATS, pantau lamaran, analisis kesiapan kerja, dan raih karier impian bersama Employr.',
    images: ['/logo.webp'],
  },
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
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
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-[#1738D1] selection:text-white font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
