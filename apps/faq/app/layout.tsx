import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pusat Bantuan & Panduan Resmi Employr",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Pusat Bantuan resmi Employr: panduan lengkap pembuatan CV ATS, evaluasi CV persona recruiter, pelacakan lamaran kerja, dan persiapan interview 100% gratis.",
  applicationName: SITE_NAME,
  keywords: [
    "Pusat Bantuan Employr",
    "FAQ Employr",
    "Panduan CV ATS",
    "Tracker Lamaran",
    "Evaluasi CV Recruiter",
    "Simulasi Interview",
    "Karier Talenta Muda",
    "Employr Indonesia",
  ],
  authors: [{ name: "Employr Team", url: "https://employr.id" }],
  creator: "Employr",
  publisher: "Employr Indonesia",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Pusat Bantuan & Panduan Resmi Employr",
    description:
      "Dokumentasi dan panduan resmi ekosistem Employr: buat CV ATS, tracker lamaran, evaluasi CV recruiter, dan persiapan interview 100% gratis.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 800,
        height: 600,
        alt: "Pusat Bantuan Employr",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pusat Bantuan & Panduan Resmi Employr",
    description:
      "Dokumentasi dan panduan resmi ekosistem Employr: buat CV ATS, tracker lamaran, evaluasi CV recruiter, dan persiapan interview 100% gratis.",
    images: ["/logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: "Dokumentasi dan panduan resmi ekosistem Employr",
      publisher: {
        "@type": "Organization",
        name: "Employr",
        url: "https://employr.id",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.webp`,
        },
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/cari?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
      inLanguage: "id-ID",
    },
  ],
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
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-50 antialiased selection:bg-cobalt-500 selection:text-white font-sans flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
