"use client"

import { Flame, CheckCircle, TrendingUp, Calendar } from "lucide-react"

interface StatsCardsProps {
  dayStreak: number
  todayStatus: "taken" | "pending" | "missed"
  monthlyRate: number
  variant?: "patient" | "caretaker"
}

export default function StatsCards({
  dayStreak,
  todayStatus,
  monthlyRate,
  variant = "patient",
}: StatsCardsProps) {
  const statusIcon = () => {
    switch (todayStatus) {
      case "taken":
        return <CheckCircle className="w-6 h-6 text-white" />
      case "pending":
        return <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
      case "missed":
        return <div className="w-6 h-6 rounded-full border-2 border-white" />
    }
  }

  const statusText = () => {
    switch (todayStatus) {
      case "taken":
        return "All Taken"
      case "pending":
        return "Pending"
      case "missed":
        return "Missed"
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5" />
        </div>
        <p className="text-3xl font-bold">{dayStreak}</p>
        <p className="text-sm text-blue-100">Day Streak</p>
      </div>

      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          {statusIcon()}
        </div>
        <p className="text-3xl font-bold">{statusText()}</p>
        <p className="text-sm text-teal-100">Today&apos;s Status</p>
      </div>

      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5" />
        </div>
        <p className="text-3xl font-bold">{monthlyRate}%</p>
        <p className="text-sm text-cyan-100">Monthly Rate</p>
      </div>
    </div>
  )
}
