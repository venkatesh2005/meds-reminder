"use client"

import { Flame, Settings, X, TrendingUp, Check, AlertCircle, Plus, Pill, Clock, Pencil, Trash2 } from "lucide-react"
import { useDashboardStats, useCalendarData } from "@/hooks/useAnalytics"
import { useMedications, useMedicationStatus, useUpdateMedication, useDeleteMedication } from "@/hooks/useMedications"
import NotificationSettingsForm from "@/components/medication/notification-settings-form"
import AddMedicationForm from "@/components/medication/add-medication-form"
import { useState, useMemo } from "react"
import type { Medication } from "@/types/medication"

interface CaretakerDashboardProps {
  patientName?: string
}

interface EditMedicationModalProps {
  medication: Medication
  onClose: () => void
  onSave: (updates: { name: string; dosage: string; reminder_time: string }) => void
  isLoading: boolean
}

function EditMedicationModal({ medication, onClose, onSave, isLoading }: EditMedicationModalProps) {
  const [name, setName] = useState(medication.name)
  const [dosage, setDosage] = useState(medication.dosage)
  const [reminderTime, setReminderTime] = useState(medication.reminder_time)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, dosage, reminder_time: reminderTime })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Edit Medication</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reminder Time</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CaretakerDashboard({ patientName = "Patient" }: CaretakerDashboardProps) {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: medications, isLoading: medsLoading } = useMedications()
  const [showSettings, setShowSettings] = useState(false)
  const [showAddMed, setShowAddMed] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [deletingMed, setDeletingMed] = useState<Medication | null>(null)

  const updateMedication = useUpdateMedication()
  const deleteMedication = useDeleteMedication()

  const today = new Date()
  const { data: calendarData } = useCalendarData(today.getFullYear(), today.getMonth())

  const medicationIds = useMemo(
    () => medications?.map((med) => med.id) ?? [],
    [medications]
  )
  const { data: statusMap } = useMedicationStatus(medicationIds)

  const pendingMeds = medications?.filter(med => !statusMap?.[med.id]) ?? []
  const takenMeds = medications?.filter(med => statusMap?.[med.id]) ?? []

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const currentDay = today.getDate()
  const takenDays = stats?.takenThisMonth ?? 0
  const missedDays = stats?.missedThisMonth ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Caretaker Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Monitoring {patientName}&apos;s medication adherence</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddMed(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Medication</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 shadow-sm transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{isLoading ? "—" : `${stats?.monthlyRate || 0}%`}</p>
                <p className="text-xs text-slate-500">Adherence Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{isLoading ? "—" : stats?.dayStreak || 0}</p>
                <p className="text-xs text-slate-500">Day Streak</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{takenDays}</p>
                <p className="text-xs text-slate-500">Days Taken</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-rose-600">{missedDays}</p>
                <p className="text-xs text-slate-500">Days Missed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Progress Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">Monthly Progress</h2>
              <p className="text-sm text-slate-400">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded" />
                <span className="text-slate-300">Taken</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-rose-400 rounded" />
                <span className="text-slate-300">Missed</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-indigo-500 rounded" />
                <span className="text-slate-300">Today</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {/* Day progress bars */}
            <div className="flex gap-0.5 sm:gap-1 mb-4 overflow-x-auto">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayData = calendarData?.find(d => {
                  const dayNum = parseInt(d.date.split("-")[2])
                  return dayNum === day
                })
                const status = dayData?.status ?? "future"

                return (
                  <div
                    key={day}
                    className={`flex-1 min-w-[8px] h-8 sm:h-10 rounded-md sm:rounded-lg transition-all hover:scale-105 cursor-default group relative ${
                      status === "pending" ? "bg-indigo-500 shadow-lg shadow-indigo-200" :
                      status === "taken" ? "bg-emerald-400" :
                      status === "missed" ? "bg-rose-400" : "bg-slate-200"
                    }`}
                    title={`Day ${day}`}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Day markers */}
            <div className="flex justify-between text-xs text-slate-400 mb-4">
              <span>1</span>
              <span>{Math.floor(daysInMonth / 4)}</span>
              <span>{Math.floor(daysInMonth / 2)}</span>
              <span>{Math.floor(daysInMonth * 3 / 4)}</span>
              <span>{daysInMonth}</span>
            </div>

            {/* Today Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">Today&apos;s Status</p>
                <p className="text-xs text-slate-500">Day {currentDay} of {daysInMonth}</p>
              </div>
              <span className={`text-sm font-semibold px-4 py-2 rounded-xl ${
                stats?.todayStatus === "taken" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {stats?.todayStatus === "taken" ? "✓ Completed" : "⏳ Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Medication Status List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">Today&apos;s Medications</h2>
              <p className="text-sm text-slate-400">
                {takenMeds.length} of {medications?.length ?? 0} taken
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full" />
                <span className="text-slate-300">Taken ({takenMeds.length})</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-400 rounded-full" />
                <span className="text-slate-300">Pending ({pendingMeds.length})</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-2">
            {medsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-14 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : !medications?.length ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Pill className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No medications added</p>
                <p className="text-sm text-slate-400 mt-1">Add medications to track adherence</p>
              </div>
            ) : (
              <>
                {/* Pending medications */}
                {pendingMeds.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{med.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-slate-500">{med.dosage}</span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-sm text-amber-600 hidden sm:inline">{med.reminder_time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <button
                        onClick={() => setEditingMed(med)}
                        className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => setDeletingMed(med)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                      <span className="hidden sm:inline text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}

                {/* Taken medications */}
                {takenMeds.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 truncate">{med.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-slate-500">{med.dosage}</span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-sm text-emerald-600 hidden sm:inline">{med.reminder_time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <button
                        onClick={() => setEditingMed(med)}
                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => setDeletingMed(med)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                      <span className="hidden sm:inline text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                        ✓ Taken
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg font-semibold text-slate-900">Notification Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-5">
                <NotificationSettingsForm />
              </div>
            </div>
          </div>
        )}

        {/* Add Medication Modal */}
        {showAddMed && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddMed(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Add Medication</h2>
                <button onClick={() => setShowAddMed(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-5">
                <AddMedicationForm onSuccess={() => setShowAddMed(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Edit Medication Modal */}
        {editingMed && (
          <EditMedicationModal
            medication={editingMed}
            onClose={() => setEditingMed(null)}
            onSave={(updates) => {
              updateMedication.mutate(
                { id: editingMed.id, updates },
                { onSuccess: () => setEditingMed(null) }
              )
            }}
            isLoading={updateMedication.isPending}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingMed && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeletingMed(null)}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Delete Medication?</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Are you sure you want to delete <span className="font-medium text-slate-700">{deletingMed.name}</span>? This will also delete all associated logs.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingMed(null)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      deleteMedication.mutate(deletingMed.id, {
                        onSuccess: () => setDeletingMed(null)
                      })
                    }}
                    disabled={deleteMedication.isPending}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleteMedication.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
