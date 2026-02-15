"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { medicationSchema, MedicationFormData } from "@/lib/validations"
import { useAddMedication } from "@/hooks/useMedications"
import { Pill, Beaker, Clock, Check, AlertCircle } from "lucide-react"

interface AddMedicationFormProps {
  onSuccess?: () => void
}

export default function AddMedicationForm({ onSuccess }: AddMedicationFormProps) {
  const addMedication = useAddMedication()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      reminder_time: "",
    },
  })

  const onSubmit = async (data: MedicationFormData) => {
    try {
      await addMedication.mutateAsync(data)
      reset()
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add medication"
      alert(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Medicine Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Pill className="w-4 h-4 text-slate-400" />
          Medicine Name
        </label>
        <input
          id="name"
          {...register("name")}
          placeholder="e.g., Aspirin"
          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors.name ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
          }`}
        />
        {errors.name && (
          <p className="flex items-center gap-1.5 text-rose-600 text-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Dosage */}
      <div className="space-y-2">
        <label htmlFor="dosage" className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Beaker className="w-4 h-4 text-slate-400" />
          Dosage
        </label>
        <input
          id="dosage"
          {...register("dosage")}
          placeholder="e.g., 500mg, 2 tablets"
          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors.dosage ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
          }`}
        />
        {errors.dosage && (
          <p className="flex items-center gap-1.5 text-rose-600 text-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.dosage.message}
          </p>
        )}
      </div>

      {/* Reminder Time */}
      <div className="space-y-2">
        <label htmlFor="reminder_time" className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Clock className="w-4 h-4 text-slate-400" />
          Reminder Time
        </label>
        <input
          id="reminder_time"
          type="time"
          {...register("reminder_time")}
          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors.reminder_time ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
          }`}
        />
        {errors.reminder_time && (
          <p className="flex items-center gap-1.5 text-rose-600 text-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.reminder_time.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || addMedication.isPending}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {isSubmitting || addMedication.isPending ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Pill className="w-5 h-5" />
            Add Medication
          </>
        )}
      </button>

      {/* Success Message */}
      {addMedication.isSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <Check className="w-4 h-4" />
          Medication added successfully!
        </div>
      )}
    </form>
  )
}
