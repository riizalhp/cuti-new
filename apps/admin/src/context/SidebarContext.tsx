"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SidebarContextType {
  collapsed: boolean
  toggleSidebar: () => void
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem("employr_admin_sidebar_collapsed") ?? localStorage.getItem("cuti_admin_sidebar_collapsed")
      if (saved !== null) {
        setCollapsedState(saved === "true")
      }
    } catch {}
  }, [])

  const setCollapsed = (newVal: boolean) => {
    setCollapsedState(newVal)
    try {
      localStorage.setItem("employr_admin_sidebar_collapsed", String(newVal))
    } catch {}
  }

  const toggleSidebar = () => {
    setCollapsedState((prev) => {
      const next = !prev
      try {
        localStorage.setItem("employr_admin_sidebar_collapsed", String(next))
      } catch {}
      return next
    })
  }

  // Trigger resize event after transition completes so charts & responsive containers adapt smoothly
  useEffect(() => {
    if (!mounted) return
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"))
    }, 320)
    return () => clearTimeout(timer)
  }, [collapsed, mounted])

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
