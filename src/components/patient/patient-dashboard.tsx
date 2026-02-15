"use client"

import { Flame, TrendingUp, Check, X, Clock } from "lucide-react"
import { useDashboardStats } from "@/hooks/useAnalytics"
import TodayMedication from "@/components/patient/today-medication"
import MedicationCalendar from "@/components/patient/medication-calendar"

export default function PatientDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Medications</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{isLoading ? "—" : stats?.dayStreak || 0}</p>
                <p className="text-xs text-slate-500">Day Streak</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{isLoading ? "—" : `${stats?.monthlyRate || 0}%`}</p>
                <p className="text-xs text-slate-500">Monthly Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stats?.todayStatus === "taken" ? "bg-emerald-100" :
                stats?.todayStatus === "missed" ? "bg-rose-100" : "bg-amber-100"
              }`}>
                {stats?.todayStatus === "taken" ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : stats?.todayStatus === "missed" ? (
                  <X className="w-5 h-5 text-rose-600" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Today</p>
                <p className={`text-xs font-medium ${
                  stats?.todayStatus === "taken" ? "text-emerald-600" :
                  stats?.todayStatus === "missed" ? "text-rose-600" : "text-amber-600"
                }`}>
                  {stats?.todayStatus === "taken" ? "All taken" :
                   stats?.todayStatus === "missed" ? "Missed" : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Calendar */}
          <div>
            <MedicationCalendar />
          </div>

          {/* Right: Today's list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Schedule</h2>
              <p className="text-sm text-slate-500">Track your daily medications</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <TodayMedication />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
