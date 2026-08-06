"use client"

import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { motion } from "framer-motion"
import { Save, Database, Bell, Shield, Mail, Globe } from "lucide-react"

export default function SettingsPage() {
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
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-purple-200">Manage system settings and configurations</p>
          </div>

          <div className="space-y-6">
            {/* General Settings */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="text-purple-300" size={24} />
                <h2 className="text-2xl font-bold text-white">General Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm mb-2">Site Name</label>
                  <input
                    type="text"
                    defaultValue="CUTI Platform"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-2">Site Description</label>
                  <textarea
                    rows={3}
                    defaultValue="Professional CV generation platform"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Database Settings */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="text-purple-300" size={24} />
                <h2 className="text-2xl font-bold text-white">Database Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm mb-2">Database URL</label>
                  <input
                    type="text"
                    defaultValue="postgresql://localhost:5432/cuti"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Test Connection
                  </button>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Backup Database
                  </button>
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="text-purple-300" size={24} />
                <h2 className="text-2xl font-bold text-white">Email Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200 text-sm mb-2">SMTP Host</label>
                  <input
                    type="text"
                    defaultValue="smtp.gmail.com"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-200 text-sm mb-2">Port</label>
                    <input
                      type="text"
                      defaultValue="587"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-2">From Email</label>
                    <input
                      type="email"
                      defaultValue="noreply@cuti.com"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="text-purple-300" size={24} />
                <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <span className="text-white">Email notifications for new users</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <span className="text-white">Email notifications for premium subscriptions</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-white">Daily activity reports</span>
                </label>
              </div>
            </div>

            {/* Security */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-purple-300" size={24} />
                <h2 className="text-2xl font-bold text-white">Security Settings</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <span className="text-white">Require 2FA for admin accounts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <span className="text-white">Enable rate limiting</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <span className="text-white">Log all admin actions</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                <Save size={20} />
                Save All Settings
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
