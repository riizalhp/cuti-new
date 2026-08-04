"use client"

import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { DataTable } from "@/components/admin/DataTable"
import { motion } from "framer-motion"
import { Search, Filter, UserPlus } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  status: string
  plan: string
  joinedDate: string
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    status: "Active",
    plan: "Premium",
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "Active",
    plan: "Free",
    joinedDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "Inactive",
    plan: "Premium",
    joinedDate: "2024-03-10",
  },
]

export default function UsersPage() {
  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            user.status === "Active"
              ? "bg-green-500/20 text-green-300"
              : "bg-gray-500/20 text-gray-300"
          }`}
        >
          {user.status}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (user: User) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            user.plan === "Premium"
              ? "bg-purple-500/20 text-purple-300"
              : "bg-blue-500/20 text-blue-300"
          }`}
        >
          {user.plan}
        </span>
      ),
    },
    { key: "joinedDate", header: "Joined Date" },
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
              <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
              <p className="text-purple-200">Manage and monitor all users</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <UserPlus size={20} />
              Add User
            </button>
          </div>

          <div className="glass-card p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
                <Filter size={20} />
                Filters
              </button>
            </div>
          </div>

          <DataTable data={mockUsers} columns={columns} />
        </motion.div>
      </main>
    </div>
  )
}
