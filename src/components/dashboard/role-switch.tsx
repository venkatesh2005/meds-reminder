"use client"

import { useRole } from "@/hooks/useRole"
import { Users, User } from "lucide-react"

export default function RoleSwitch() {
  const { role, toggleRole } = useRole()

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-slate-100 rounded-lg sm:rounded-xl">
      <button
        onClick={() => role !== "patient" && toggleRole()}
        className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
          role === "patient"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Patient</span>
      </button>
      <button
        onClick={() => role !== "caretaker" && toggleRole()}
        className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
          role === "caretaker"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Caretaker</span>
      </button>
    </div>
  )
}
