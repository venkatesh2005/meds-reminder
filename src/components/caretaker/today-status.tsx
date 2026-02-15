"use client"

import { useMedications, useMedicationStatus } from "@/hooks/useMedications"
import { useMemo } from "react"
import { Calendar, Clock } from "lucide-react"

export default function TodayStatus() {
  const { data: medications, isLoading } = useMedications()

  const medicationIds = useMemo(
    () => medications?.map((med) => med.id) ?? [],
    [medications]
  )

  const { data: statusMap } = useMedicationStatus(medicationIds)

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Today&apos;s Status
      </h3>

      {!medications?.length ? (
        <p className="text-gray-500">No medications scheduled.</p>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => {
            const isTaken = statusMap?.[med.id] ?? false

            return (
              <div
                key={med.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-800">{med.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {med.reminder_time}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isTaken
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isTaken ? "Taken" : "Pending"}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
