"use client"

import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  trend: "up" | "down"
}

export function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-navy-50 dark:bg-navy-950/80 border border-navy-100 dark:border-navy-800 text-[#1F3578] dark:text-navy-300">
          <Icon size={20} />
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            trend === "up"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
          }`}
        >
          {change}
        </span>
      </div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{value}</p>
    </motion.div>
  )
}
