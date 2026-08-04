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
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-purple-500/20">
          <Icon className="text-purple-300" size={24} />
        </div>
        <span
          className={`text-sm font-medium ${
            trend === "up" ? "text-green-400" : "text-red-400"
          }`}
        >
          {change}
        </span>
      </div>
      <h3 className="text-purple-200 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  )
}
