"use client"

interface AdherenceProgressProps {
  takenDays: number
  missedDays: number
  remainingDays: number
  percentage: number
}

export default function AdherenceProgress({
  takenDays,
  missedDays,
  remainingDays,
  percentage,
}: AdherenceProgressProps) {
  const totalDays = takenDays + missedDays + remainingDays

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Adherence Progress</h3>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Overall Progress</span>
        <span className="text-sm font-semibold text-gray-800">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${(takenDays / totalDays) * 100}%` }}
        />
        <div
          className="h-full bg-red-400 transition-all duration-500"
          style={{ width: `${(missedDays / totalDays) * 100}%` }}
        />
        <div
          className="h-full bg-gray-200 transition-all duration-500"
          style={{ width: `${(remainingDays / totalDays) * 100}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-600">{takenDays} days</p>
          <p className="text-xs text-gray-500">Taken</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-500">{missedDays} days</p>
          <p className="text-xs text-gray-500">Missed</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-400">{remainingDays} days</p>
          <p className="text-xs text-gray-500">Remaining</p>
        </div>
      </div>
    </div>
  )
}
