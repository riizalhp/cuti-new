"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
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
  TrendingUp,
  Compass,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useTheme } from "@/context/ThemeContext"
import { useSidebar } from "@/context/SidebarContext"

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
      { title: "CMS & Lowongan", href: "/cms", icon: BookOpen },
    ],
  },
  {
    title: "Growth & Marketing",
    items: [
      { title: "Campaigns", href: "/campaigns", icon: Megaphone },
      { title: "Growth Center", href: "/growth", icon: TrendingUp },
    ],
  },
  {
    title: "AI & Intelligence",
    items: [
      { title: "AI Config & Usage", href: "/ai-config", icon: Cpu },
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
    const cookie = document.cookie.split(";").find((c) => c.trim().startsWith("employr_admin_session=") || c.trim().startsWith("cuti_admin_session="))
    if (cookie) {
      return JSON.parse(decodeURIComponent(cookie.split("=")[1]))
    }
  } catch {}
  return null
}

export function AdminSidebar() {
  const { collapsed } = useSidebar()
  const [adminName, setAdminName] = useState("")
  const [liveVisitorCount, setLiveVisitorCount] = useState<number>(0)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const session = getAdminSession()
    if (session?.name) setAdminName(session.name)

    // Fetch live visitors count periodically
    const fetchLiveCount = async () => {
      try {
        const res = await fetch("/api/visitors/live")
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
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0, width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 bottom-0 bg-[#0B132B] border-r border-slate-800 z-50 shadow-xl"
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className={`flex items-center mb-5 pt-1 transition-all duration-300 ${collapsed ? "justify-center px-0" : "justify-start px-2"}`}>
          <Link href="/" className="relative flex items-center justify-center h-8 overflow-hidden">
            {/* Full Expanded Logo */}
            <div
              className={`transition-all duration-300 ease-in-out flex items-center ${
                collapsed
                  ? "opacity-0 scale-90 pointer-events-none absolute"
                  : "opacity-100 scale-100 relative"
              }`}
            >
              <Image
                src="/logo.webp"
                alt="Employr Logo"
                width={140}
                height={32}
                unoptimized
                className="h-7 w-auto max-w-[120px] object-contain brightness-0 invert"
              />
            </div>

            {/* Minimized Icon Logo */}
            <div
              className={`transition-all duration-300 ease-in-out flex items-center ${
                collapsed
                  ? "opacity-100 scale-100 relative"
                  : "opacity-0 scale-75 pointer-events-none absolute"
              }`}
            >
              <Image
                src="/logo-minimize.webp"
                alt="Employr Logo"
                width={32}
                height={32}
                unoptimized
                className="h-7 w-7 object-contain brightness-0 invert"
              />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-3.5 [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-slate-700">
          {navSections.map((section, sectionIdx) => (
            <div key={section.title} className="space-y-1">
              {/* Section Header or Divider */}
              {collapsed ? (
                sectionIdx > 0 && <div className="my-2 border-t border-slate-800/80 mx-2" />
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
                  const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.title : undefined}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                        collapsed ? "justify-center px-0" : ""
                      } ${
                        isActive
                          ? "bg-[#1F3578] text-white border-l-[3px] border-orange-500 shadow-xs pl-3 font-semibold"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={`flex-shrink-0 ${
                          isActive ? "text-orange-400" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="truncate"
                          >
                            {item.title}
                          </motion.span>
                          {item.href === "/visitors" && liveVisitorCount > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                              <span>{liveVisitorCount}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions: Theme Toggle & Logout */}
        <div className="space-y-1.5 border-t border-slate-800 pt-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={collapsed ? (theme === "dark" ? "Mode Terang" : "Mode Gelap") : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors text-xs font-medium ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            {theme === "dark" ? (
              <Sun size={19} className="text-amber-400 flex-shrink-0" />
            ) : (
              <Moon size={19} className="text-indigo-300 flex-shrink-0" />
            )}
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
              </motion.span>
            )}
          </button>

          {/* User Info */}
          {adminName && !collapsed && (
            <div className="px-3.5 py-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Masuk sebagai</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{adminName}</p>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                // Clear admin session cookie
                document.cookie = 'employr_admin_session=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
                document.cookie = 'cuti_admin_session=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
              }
            }}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-900/50 text-xs font-medium cursor-pointer ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut size={19} className="flex-shrink-0" />
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
