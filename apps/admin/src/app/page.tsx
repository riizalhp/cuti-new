"use client"

import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { StatsCard } from "@/components/admin/StatsCard"
import { Users, FileText, DollarSign, Activity } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      trend: "up" as const,
    },
    {
      title: "Premium Users",
      value: "342",
      change: "+8.2%",
      icon: DollarSign,
      trend: "up" as const,
    },
    {
      title: "CVs Generated",
      value: "5,891",
      change: "+23.1%",
      icon: FileText,
      trend: "up" as const,
    },
    {
      title: "Active Sessions",
      value: "184",
      change: "-2.4%",
      icon: Activity,
      trend: "down" as const,
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <AdminSidebar />

      <main className="flex-1 p-8 ml-64">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-purple-200">Welcome back, Admin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="text-white font-medium">User signed up</p>
                      <p className="text-purple-200 text-sm">{i} minutes ago</p>
                    </div>
                    <span className="text-purple-300 text-sm">New</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  View All Users
                </button>
                <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                  Manage Campaigns
                </button>
                <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
