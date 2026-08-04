"use client"

import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { motion } from "framer-motion"
import { Plus, Calendar, Users, TrendingUp } from "lucide-react"

interface Campaign {
  id: string
  name: string
  status: "Active" | "Scheduled" | "Completed"
  startDate: string
  endDate: string
  participants: number
  conversion: string
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Job Fair 2024",
    status: "Active",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    participants: 1250,
    conversion: "12.5%",
  },
  {
    id: "2",
    name: "Premium Launch Campaign",
    status: "Completed",
    startDate: "2024-03-01",
    endDate: "2024-05-31",
    participants: 892,
    conversion: "8.3%",
  },
  {
    id: "3",
    name: "Back to School Special",
    status: "Scheduled",
    startDate: "2024-09-01",
    endDate: "2024-09-30",
    participants: 0,
    conversion: "0%",
  },
]

export default function CampaignsPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <AdminSidebar />

      <main className="flex-1 p-8 ml-64">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Campaign Management</h1>
              <p className="text-purple-200">Create and manage marketing campaigns</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <Plus size={20} />
              New Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="text-green-300" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">Active Campaigns</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {mockCampaigns.filter((c) => c.status === "Active").length}
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="text-blue-300" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">Scheduled</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {mockCampaigns.filter((c) => c.status === "Scheduled").length}
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="text-purple-300" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">Total Reach</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {mockCampaigns.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {mockCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                whileHover={{ scale: 1.01 }}
                className="glass-card p-6 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === "Active"
                            ? "bg-green-500/20 text-green-300"
                            : campaign.status === "Scheduled"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-6 mt-4">
                      <div>
                        <p className="text-purple-300 text-sm mb-1">Start Date</p>
                        <p className="text-white font-medium">{campaign.startDate}</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-sm mb-1">End Date</p>
                        <p className="text-white font-medium">{campaign.endDate}</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-sm mb-1">Participants</p>
                        <p className="text-white font-medium">{campaign.participants.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-sm mb-1">Conversion</p>
                        <p className="text-white font-medium">{campaign.conversion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
