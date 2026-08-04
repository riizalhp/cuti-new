"use client"

import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { DataTable } from "@/components/admin/DataTable"
import { motion } from "framer-motion"
import { Search, Filter, Plus } from "lucide-react"

interface CV {
  id: string
  userName: string
  template: string
  status: string
  createdDate: string
  lastModified: string
}

const mockCVs: CV[] = [
  {
    id: "1",
    userName: "John Doe",
    template: "Professional",
    status: "Completed",
    createdDate: "2024-01-20",
    lastModified: "2024-01-22",
  },
  {
    id: "2",
    userName: "Jane Smith",
    template: "Modern",
    status: "Draft",
    createdDate: "2024-02-15",
    lastModified: "2024-02-16",
  },
  {
    id: "3",
    userName: "Bob Johnson",
    template: "Creative",
    status: "Completed",
    createdDate: "2024-03-05",
    lastModified: "2024-03-08",
  },
]

export default function CVPage() {
  const columns = [
    { key: "userName", header: "User" },
    { key: "template", header: "Template" },
    {
      key: "status",
      header: "Status",
      render: (cv: CV) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            cv.status === "Completed"
              ? "bg-green-500/20 text-green-300"
              : "bg-yellow-500/20 text-yellow-300"
          }`}
        >
          {cv.status}
        </span>
      ),
    },
    { key: "createdDate", header: "Created" },
    { key: "lastModified", header: "Last Modified" },
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">CV Management</h1>
              <p className="text-purple-200">Monitor and manage all generated CVs</p>
            </div>
          </div>

          <div className="glass-card p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
                <input
                  type="text"
                  placeholder="Search CVs..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
                <Filter size={20} />
                Filters
              </button>
            </div>
          </div>

          <DataTable data={mockCVs} columns={columns} />
        </motion.div>
      </main>
    </div>
  )
}
