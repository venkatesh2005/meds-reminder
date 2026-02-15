"use client"

import { useMedications, useMedicationStatus, useMarkTaken } from "@/hooks/useMedications"
import { useMemo, useCallback } from "react"

export default function MedicationList() {
  const { data: medications, isLoading, error } = useMedications()

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

  if (isLoading) {
    return (
      <div className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm">
        <p className="text-gray-600">Loading medications...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm">
        <p className="text-red-600">Error loading medications: {error.message}</p>
      </div>
    )
  }

  if (!medications?.length) {
    return (
      <div className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Medications</h2>
        <p className="text-gray-600">No medications added yet. Add your first medication above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Your Medications</h2>

      {medications.map((med) => {
        const isTaken = statusMap?.[med.id] ?? false
        const isMarking = markTaken.isPending && markTaken.variables === med.id

        return (
          <div
            key={med.id}
            className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-gray-800">{med.name}</p>
              <p className="text-sm text-gray-600">{med.dosage}</p>
              <p className="text-sm text-gray-500">
                Reminder: {med.reminder_time}
              </p>
            </div>

            <div>
              {statusLoading ? (
                <span className="text-gray-400">Checking...</span>
              ) : isTaken ? (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Taken Today
                </span>
              ) : (
                <button
                  onClick={() => handleMarkTaken(med.id)}
                  disabled={isMarking}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1.5 rounded font-medium transition-colors"
                >
                  {isMarking ? "Saving..." : "Mark Taken"}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
