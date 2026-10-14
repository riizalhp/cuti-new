"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { useSidebar } from "@/context/SidebarContext"

const VALID_SIDEBAR_PREFIXES = [
  "/ai-config",
  "/ai-live",
  "/ai-quality",
  "/blueprints",
  "/broadcast",
  "/campaigns",
  "/cms/jobs",
  "/cv",
  "/data-quality",
  "/data-scraper",
  "/feature-adoption",
  "/growth",
  "/laporan-bug",
  "/logs",
  "/newsletter",
  "/pre-register",
  "/saran-fitur",
  "/scraper-config",
  "/settings",
  "/system-intelligence",
  "/users",
  "/visitors",
]

function isValidAdminRoute(path: string | null): boolean {
  if (!path) return false
  if (path === "/" || path === "/cms") return true
  if (path === "/login" || path.startsWith("/cms/editor")) return false
  return VALID_SIDEBAR_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { hideSidebar } = useSidebar()

  const isNoSidebar =
    hideSidebar ||
    pathname === "/login" ||
    pathname?.startsWith("/cms/editor") ||
    !isValidAdminRoute(pathname)

  if (isNoSidebar) {
    return (
      <main className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">
        {children}
      </main>
    )
  }

  return (
    <div
      id="admin-root-layout"
      className="h-full min-h-full max-h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex transition-colors font-sans print:h-auto print:overflow-visible print:block print:bg-white"
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:h-auto print:overflow-visible print:block">
        <main
          id="admin-main-scroll"
          className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 w-full no-scrollbar print:h-auto print:overflow-visible print:p-0 print:m-0 print:block"
        >
          <div className="w-full mx-auto space-y-6 print:p-0 print:m-0 print:space-y-0 print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
