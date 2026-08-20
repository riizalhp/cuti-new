import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/context/ThemeContext"
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CUTI Admin Panel",
  description: "Admin dashboard for CUTI platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased transition-colors duration-200">
        <ThemeProvider>
          <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
