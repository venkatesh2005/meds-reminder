"use client"

import { useMedications, useMedicationStatus, useMarkTaken } from "@/hooks/useMedications"
import { useMemo, useCallback } from "react"
import { Check, Clock, Pill } from "lucide-react"

export default function TodayMedication() {
  const { data: medications, isLoading } = useMedications()

  const medicationIds = useMemo(
    () => medications?.map((med) => med.id) ?? [],
    [medications]
  )

  const { data: statusMap, isLoading: statusLoading } = useMedicationStatus(medicationIds)
  const markTaken = useMarkTaken()

  const handleMarkTaken = useCallback(
    async (id: string) => {
      try {
        await markTaken.mutateAsync(id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to mark as taken"
        alert(errorMessage)
      }
    },
    [markTaken]
  )

  if (isLoading || statusLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!medications?.length) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Pill className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No medications yet</p>
        <p className="text-sm text-slate-400 mt-1">Add your first medication to get started</p>
      </div>
    )
  }

  const pendingMeds = medications.filter(med => !statusMap?.[med.id])
  const takenMeds = medications.filter(med => statusMap?.[med.id])

  return (
    <div className="p-4 space-y-3">
      {/* Pending medications */}
      {pendingMeds.map((med) => {
        const isMarking = markTaken.isPending && markTaken.variables === med.id

        return (
          <div
            key={med.id}
            className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border-2 border-transparent hover:border-indigo-200 hover:bg-white transition-all cursor-pointer group"
            onClick={() => !isMarking && handleMarkTaken(med.id)}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isMarking ? "bg-emerald-100" : "bg-white border-2 border-slate-200 group-hover:border-emerald-400 group-hover:bg-emerald-50"
            }`}>
              {isMarking ? (
                <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              ) : (
                <Pill className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{med.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">{med.dosage}</span>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-indigo-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {med.reminder_time}
                </span>
              </div>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              Take
            </button>
          </div>
        )
      })}

      {/* Taken medications */}
      {takenMeds.length > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Completed</p>
          {takenMeds.map((med) => (
            <div key={med.id} className="flex items-center gap-4 p-3 rounded-xl opacity-70">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-500 line-through truncate">{med.name}</p>
                <p className="text-sm text-slate-400">{med.dosage}</p>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Done</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick action */}
      {pendingMeds.length > 1 && (
        <button
          onClick={() => pendingMeds.forEach((med) => handleMarkTaken(med.id))}
          className="w-full py-3 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
        >
          ✓ Mark All as Taken
        </button>
      )}
    </div>
  )
}
