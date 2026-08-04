import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'CUTI - Career Development Platform',
  description:
    'Your premium career development platform with AI-powered CV builder, job tracking, and career readiness tools',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-violet-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
