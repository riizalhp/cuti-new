"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { useSidebar } from "@/context/SidebarContext"

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()
  const isNoSidebar = pathname === "/login" || pathname?.startsWith("/cms/editor")

  if (isNoSidebar) {
    return <main className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">{children}</main>
  }

  return (
    <div className="flex min-h-[100vh] bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <AdminSidebar />
      <main
        className={`flex-1 p-6 md:p-8 min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  )
}
