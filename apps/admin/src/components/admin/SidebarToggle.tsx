"use client"

import { useSidebar } from "@/context/SidebarContext"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

interface SidebarToggleProps {
  className?: string
}

export function SidebarToggle({ className = "" }: SidebarToggleProps) {
  const { collapsed, toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={`group flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 shadow-xs transition-all duration-200 cursor-pointer shrink-0 ${className}`}
      title={collapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
      aria-label={collapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
    >
      {collapsed ? (
        <PanelLeftOpen size={20} className="transition-transform duration-200 group-hover:scale-105" />
      ) : (
        <PanelLeftClose size={20} className="transition-transform duration-200 group-hover:scale-105" />
      )}
    </button>
  )
}
