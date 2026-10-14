"use client"

import { AdminPageWrapper } from "@/components/admin/AdminPageWrapper"
import { SidebarToggle } from "@/components/admin/SidebarToggle"
import { Activity } from "lucide-react"
import { AiLiveTrackerView } from "@/components/admin/AiLiveTrackerView"

export default function AiLivePage() {
  return (
    <AdminPageWrapper className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2.5">
              <Activity size={26} className="text-emerald-500" />
              Real-Time AI Tracking
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Pemantauan aktivitas AI, pengguna aktif, model yang dipanggil, konsumsi token, dan biaya riil
            </p>
          </div>
        </div>
      </div>

      {/* Main Live Telemetry View */}
      <AiLiveTrackerView />
    </AdminPageWrapper>
  )
}
