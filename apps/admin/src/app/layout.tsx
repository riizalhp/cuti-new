import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { ThemeProvider } from "@/context/ThemeContext"

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
          <div className="flex min-h-[125vh] bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-200">
            <AdminSidebar />
            <main className="flex-1 p-6 md:p-8 ml-20 sm:ml-64 transition-all duration-300">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
