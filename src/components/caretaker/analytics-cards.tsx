"use client"

import { TrendingUp, Flame, XCircle, CheckCircle } from "lucide-react"

interface CaretakerStatsProps {
  adherenceRate: number
  currentStreak: number
  missedThisMonth: number
  takenThisWeek: number
}

export default function CaretakerStatsCards({
  adherenceRate,
  currentStreak,
  missedThisMonth,
  takenThisWeek,
}: CaretakerStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
        <p className="text-3xl font-bold">{adherenceRate}%</p>
        <p className="text-sm text-emerald-100">Adherence Rate</p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
        <p className="text-3xl font-bold">{currentStreak}</p>
        <p className="text-sm text-blue-100">Current Streak</p>
      </div>

      <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-4 text-white">
        <p className="text-3xl font-bold">{missedThisMonth}</p>
        <p className="text-sm text-rose-100">Missed This Month</p>
      </div>

      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 text-white">
        <p className="text-3xl font-bold">{takenThisWeek}</p>
        <p className="text-sm text-cyan-100">Taken This Week</p>
      </div>
    </div>
  )
}
