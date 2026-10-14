"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SidebarContextType {
  collapsed: boolean
  mobileOpen: boolean
  hideSidebar: boolean
  toggleSidebar: () => void
  setCollapsed: (collapsed: boolean) => void
  setMobileOpen: (open: boolean) => void
  closeMobileSidebar: () => void
  setHideSidebar: (hide: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false)
  const [mobileOpen, setMobileOpenState] = useState(false)
  const [hideSidebar, setHideSidebarState] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem("employr_admin_sidebar_collapsed") ?? localStorage.getItem("cuti_admin_sidebar_collapsed")
      if (saved !== null) {
        setCollapsedState(saved === "true")
      }
    } catch {}

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpenState(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const setCollapsed = (newVal: boolean) => {
    setCollapsedState(newVal)
    try {
      localStorage.setItem("employr_admin_sidebar_collapsed", String(newVal))
    } catch {}
  }

  const setMobileOpen = (open: boolean) => {
    setMobileOpenState(open)
  }

  const closeMobileSidebar = () => {
    setMobileOpenState(false)
  }

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpenState((prev) => !prev)
    } else {
      setCollapsedState((prev) => {
        const next = !prev
        try {
          localStorage.setItem("employr_admin_sidebar_collapsed", String(next))
        } catch {}
        return next
      })
    }
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
    <SidebarContext.Provider
      value={{
        collapsed,
        mobileOpen,
        hideSidebar,
        toggleSidebar,
        setCollapsed,
        setMobileOpen,
        closeMobileSidebar,
        setHideSidebar: setHideSidebarState,
      }}
    >
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
