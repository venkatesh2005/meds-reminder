"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { useCalendarData } from "@/hooks/useAnalytics"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function MedicationCalendar() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const { data: calendarData, isLoading } = useCalendarData(currentYear, currentMonth)

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
    else { setCurrentMonth(currentMonth - 1) }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
    else { setCurrentMonth(currentMonth + 1) }
  }

  const getStatusForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return calendarData?.find((d) => d.date === dateStr)?.status ?? "future"
  }

  const isToday = (day: number) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  const isPast = (day: number) => new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const takenCount = calendarData?.filter(d => d.status === "taken").length ?? 0
  const missedCount = calendarData?.filter(d => d.status === "missed").length ?? 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex items-center justify-between">
          <button 
            onClick={goToPrevMonth} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">{MONTHS[currentMonth]}</h2>
            <p className="text-xs text-white/70">{currentYear}</p>
          </div>
          <button 
            onClick={goToNextMonth} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* Stats in header */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-white font-medium">{takenCount}</span>
            <span className="text-xs text-white/60">taken</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-rose-400 flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-white font-medium">{missedCount}</span>
            <span className="text-xs text-white/60">missed</span>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {DAYS.map((d, i) => (
          <div 
            key={i} 
            className={`py-2.5 text-center text-xs font-semibold ${
              i === 0 || i === 6 ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {d.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="p-3">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const status = getStatusForDay(day)
              const todayDate = isToday(day)
              const past = isPast(day)

              return (
                <div 
                  key={day} 
                  className={`aspect-square relative flex items-center justify-center rounded-xl cursor-default transition-all ${
                    todayDate 
                      ? "bg-indigo-500 shadow-lg shadow-indigo-200" 
                      : status === "taken" 
                      ? "bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100" 
                      : status === "missed" 
                      ? "bg-rose-50 border-2 border-rose-200 hover:bg-rose-100" 
                      : past 
                      ? "bg-slate-50" 
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    todayDate 
                      ? "text-white" 
                      : status === "taken" 
                      ? "text-emerald-700" 
                      : status === "missed" 
                      ? "text-rose-700" 
                      : past 
                      ? "text-slate-300" 
                      : "text-slate-700"
                  }`}>
                    {day}
                  </span>
                  
                  {/* Status indicator */}
                  {status === "taken" && !todayDate && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </span>
                  )}
                  {status === "missed" && !todayDate && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center">
                      <X className="w-2 h-2 text-white" />
                    </span>
                  )}
                  {todayDate && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-indigo-500 bg-white px-1.5 rounded-full shadow-sm">
                      TODAY
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-xs text-slate-600">Taken</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-rose-500" />
          <span className="text-xs text-slate-600">Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-indigo-500" />
          <span className="text-xs text-slate-600">Today</span>
        </div>
      </div>
    </div>
  )
}
