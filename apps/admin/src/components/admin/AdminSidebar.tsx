"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Cpu,
  BookOpen,
  LogOut,
  Sun,
  Moon,
  Activity,
  UserPlus,
  Zap,
  Globe,
  Radio,
  Compass,
  Brain,
  ShieldAlert,
  Lightbulb,
  Trophy,
  Briefcase,
  DownloadCloud,
  Mail,
  CalendarDays,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useTheme } from "@/context/ThemeContext"
import { useSidebar } from "@/context/SidebarContext"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Visitor Live", href: "/visitors", icon: Globe },
    ],
  },
  {
    title: "Core Management",
    items: [
      { title: "Users", href: "/users", icon: Users },
      { title: "Pre-Register", href: "/pre-register", icon: UserPlus },
      { title: "CV Management", href: "/cv", icon: FileText },
      { title: "Career Blueprints", href: "/blueprints", icon: Compass },
      { title: "CMS & Konten", href: "/cms", icon: BookOpen },
      { title: "Kelola Lowongan", href: "/cms/jobs", icon: Briefcase },
      { title: "Data Scraper Hub", href: "/data-scraper", icon: DownloadCloud },
      { title: "Saran Fitur", href: "/saran-fitur", icon: Lightbulb },
      { title: "Laporan Bug", href: "/laporan-bug", icon: ShieldAlert },
    ],
  },
  {
    title: "Growth & Marketing",
    items: [
      { title: "Kemitraan & Event", href: "/kemitraan", icon: CalendarDays },
      { title: "Newsletter", href: "/newsletter", icon: Mail },
      { title: "Broadcast", href: "/broadcast", icon: Radio },
      { title: "Misi Cuan", href: "/campaigns", icon: Trophy },
    ],
  },
  {
    title: "AI & Intelligence",
    items: [
      { title: "AI Live Tracker", href: "/ai-live", icon: Activity, badge: "LIVE" },
      { title: "AI Config & Pool", href: "/ai-config", icon: Cpu },
      { title: "LinkedIn Scraper Pool", href: "/scraper-config", icon: Zap },
      { title: "System Intelligence", href: "/system-intelligence", icon: Brain },
    ],
  },
  {
    title: "System & Security",
    items: [
      { title: "Logs & Security", href: "/logs", icon: Activity },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

function getAdminSession() {
  if (typeof window === "undefined") return null
  try {
    const cookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("employr_admin_session=") || c.trim().startsWith("cuti_admin_session="))
    if (cookie) {
      return JSON.parse(decodeURIComponent(cookie.split("=")[1]))
    }
  } catch {}
  return null
}

export function AdminSidebar() {
  const { collapsed, mobileOpen, closeMobileSidebar } = useSidebar()
  const [adminName, setAdminName] = useState("")
  const [liveVisitorCount, setLiveVisitorCount] = useState<number>(0)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const session = getAdminSession()
    if (session?.name) setAdminName(session.name)

    const fetchLiveCount = async () => {
      try {
        const res = await fetch("/api/visitors/live?countOnly=true")
        const json = await res.json()
        if (json.success && typeof json.data?.count === "number") {
          setLiveVisitorCount(json.data.count)
        }
      } catch {}
    }

    fetchLiveCount()
    const interval = setInterval(fetchLiveCount, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-screen transition-all duration-300 ease-in-out z-50 overflow-hidden border-r border-slate-800 bg-[#0B132B] shadow-xl text-slate-300",
          // Desktop behavior (matches dashboard user layout)
          "md:sticky md:top-0 md:z-20 md:flex-shrink-0 md:h-full",
          collapsed ? "md:w-20" : "md:w-64",
          // Mobile behavior: slide-over drawer
          "fixed inset-y-0 left-0 w-72 shadow-2xl md:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Logo Header (Sticky Top, 64px height) */}
        <div
          className={cn(
            "relative px-4 pt-4 pb-3.5 flex items-center justify-between border-b border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 min-h-[64px]",
            collapsed ? "md:justify-center md:px-2" : "px-4"
          )}
        >
          <Link
            href="/"
            onClick={closeMobileSidebar}
            className="relative flex items-center justify-center group h-8 overflow-hidden"
          >
            {/* Full Expanded Logo */}
            <div
              className={cn(
                "transition-all duration-300 ease-in-out flex items-center",
                collapsed
                  ? "md:opacity-0 md:scale-90 md:pointer-events-none md:absolute"
                  : "opacity-100 scale-100 relative"
              )}
            >
              <Image
                src="/logo.webp"
                alt="Employr Logo"
                width={140}
                height={32}
                unoptimized
                className="h-7 w-auto max-w-[120px] object-contain brightness-0 invert"
              />
              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Admin
              </span>
            </div>

            {/* Minimized Icon Logo */}
            <div
              className={cn(
                "transition-all duration-300 ease-in-out flex items-center justify-center",
                collapsed
                  ? "opacity-100 scale-100 relative"
                  : "opacity-0 scale-75 pointer-events-none absolute"
              )}
            >
              <Image
                src="/logo-minimize.webp"
                alt="Employr"
                width={32}
                height={32}
                unoptimized
                className="h-7 w-7 object-contain brightness-0 invert"
              />
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section (Scrollable Middle Area) */}
        <div
          className={cn(
            "flex-1 overflow-y-auto sidebar-scrollbar pr-1 pt-3 pb-4 transition-all duration-300 ease-in-out space-y-3.5",
            collapsed ? "md:px-2 px-3" : "px-3"
          )}
        >
          {navSections.map((section, sectionIdx) => (
            <div key={section.title} className="space-y-1">
              {/* Section Header or Divider */}
              {collapsed ? (
                <>
                  <div className="hidden md:block">
                    {sectionIdx > 0 && <div className="my-2 border-t border-slate-800/80 mx-2" />}
                  </div>
                  <div className="block md:hidden px-3 pb-1 select-none pt-2">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400/70 uppercase">
                      {section.title}
                    </p>
                  </div>
                </>
              ) : (
                <div className={`px-3 pb-1 select-none ${sectionIdx === 0 ? "pt-0.5" : "pt-2"}`}>
                  <p className="text-[10px] font-bold tracking-wider text-slate-400/70 uppercase">
                    {section.title}
                  </p>
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : item.href === "/cms"
                      ? pathname === "/cms" || pathname?.startsWith("/cms/editor")
                      : pathname === item.href || pathname?.startsWith(item.href + "/")

                  const titleAttr = collapsed ? item.title : undefined

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      title={titleAttr}
                      className={cn(
                        "w-full flex items-center rounded-lg text-xs font-semibold transition-all duration-200 group relative cursor-pointer",
                        collapsed
                          ? "md:justify-center md:p-2.5 px-3.5 py-2.5"
                          : "justify-between px-3.5 py-2.5",
                        isActive
                          ? "bg-[#1F3578] text-white border-l-[3px] border-orange-500 shadow-xs pl-3 font-semibold"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <item.icon
                          size={18}
                          className={cn(
                            "flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                            isActive ? "text-orange-400" : "text-slate-400 group-hover:text-slate-200"
                          )}
                        />
                        <span
                          className={cn(
                            "truncate transition-all duration-200 ease-in-out whitespace-nowrap",
                            collapsed
                              ? "md:max-w-0 md:opacity-0 md:transform md:-translate-x-2 md:pointer-events-none"
                              : "max-w-[155px] opacity-100 transform translate-x-0"
                          )}
                        >
                          {item.title}
                        </span>
                      </div>

                      {item.href === "/visitors" && liveVisitorCount > 0 && (
                        <span
                          className={cn(
                            "flex items-center gap-1 rounded-full text-[10px] font-bold transition-all duration-200 whitespace-nowrap",
                            collapsed
                              ? "md:absolute md:-top-1 md:-right-1 md:w-2.5 md:h-2.5 md:bg-emerald-500 md:border md:border-slate-900 md:p-0 md:text-[0px]"
                              : "px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                          {(!collapsed || typeof window === "undefined") && <span>{liveVisitorCount}</span>}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Bottom Actions: Theme Toggle & Logout */}
        <div
          className={cn(
            "shrink-0 border-t border-slate-800/80 p-3 space-y-1.5 transition-all duration-300 ease-in-out",
            collapsed ? "md:p-2" : "p-3"
          )}
        >
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={collapsed ? (theme === "dark" ? "Mode Terang" : "Mode Gelap") : undefined}
            className={cn(
              "w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors text-xs font-semibold cursor-pointer",
              collapsed ? "md:justify-center md:px-0" : ""
            )}
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-amber-400 flex-shrink-0" />
            ) : (
              <Moon size={18} className="text-indigo-300 flex-shrink-0" />
            )}
            <span
              className={cn(
                "truncate transition-all duration-200",
                collapsed ? "md:hidden" : "inline"
              )}
            >
              {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            </span>
          </button>

          {/* User Info */}
          {adminName && (
            <div
              className={cn(
                "px-3 py-1.5 rounded-md bg-slate-900/60 border border-slate-800/60",
                collapsed ? "md:hidden" : "block"
              )}
            >
              <p className="text-[10px] text-slate-400">Masuk sebagai</p>
              <p className="text-xs font-bold text-slate-200 truncate">{adminName}</p>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                document.cookie =
                  "employr_admin_session=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax"
                document.cookie =
                  "cuti_admin_session=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax"
                localStorage.clear()
                sessionStorage.clear()
                window.location.href = "/login"
              }
            }}
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-slate-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-900/50 text-xs font-semibold cursor-pointer",
              collapsed ? "md:justify-center md:px-0" : ""
            )}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span
              className={cn(
                "truncate transition-all duration-200",
                collapsed ? "md:hidden" : "inline"
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
