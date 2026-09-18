import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/context/ThemeContext"
import { SidebarProvider } from "@/context/SidebarContext"
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Employr Admin Panel",
  description: "Admin dashboard for Employr platform",
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased transition-colors duration-200`}>
        <ThemeProvider>
          <SidebarProvider>
            <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
