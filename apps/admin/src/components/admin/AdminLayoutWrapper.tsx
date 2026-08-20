"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  if (isLoginPage) {
    return <main className="min-h-screen w-full">{children}</main>
  }

  return (
    <div className="flex min-h-[100vh] bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 ml-20 sm:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
