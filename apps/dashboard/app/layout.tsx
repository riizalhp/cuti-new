import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Employr — Career Operating System',
  description:
    'Platform karier terpadu untuk talenta muda Indonesia: buat CV ATS, pantau lamaran, analisis kesiapan kerja, dan raih karier impian.',
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
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,800,700,600,500,400,300&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,300..800&family=Instrument+Serif:ital@0;1&family=Inter+Tight:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-[#1738D1] selection:text-white font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
