"use client"

import { useState } from "react"
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
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useTheme } from "@/context/ThemeContext"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Users", href: "/users", icon: Users },
  { title: "CV Management", href: "/cv", icon: FileText },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "CMS Konten", href: "/cms", icon: BookOpen },
  { title: "AI Config", href: "/ai-config", icon: Cpu },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0, width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 bottom-0 bg-[#0B132B] border-r border-slate-800 z-50 shadow-xl"
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8 px-2 pt-2">
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
                width={130}
                height={32}
                unoptimized
                className="h-[26px] w-auto max-w-[115px] object-contain brightness-0 invert"
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
                width={28}
                height={28}
                unoptimized
                className="h-6 w-6 object-contain brightness-0 invert"
              />
            </div>
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-[#1F3578] text-white border-l-[3px] border-orange-500 shadow-xs pl-3 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <item.icon size={19} className={`flex-shrink-0 ${isActive ? "text-orange-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.title}
                  </motion.span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions: Theme Toggle & Logout */}
        <div className="space-y-1.5 border-t border-slate-800 pt-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors text-xs font-medium"
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

          {/* Logout */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
                const landingUrl =
                  process.env.NEXT_PUBLIC_LANDING_URL ||
                  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'http://localhost:4321'
                    : 'https://employr.id');
                window.location.href = landingUrl;
              }
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-900/50 text-xs font-medium cursor-pointer"
          >
            <LogOut size={19} className="flex-shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
