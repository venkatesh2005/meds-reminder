"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { caretakerSchema, CaretakerFormData } from "@/lib/validations"
import { useCaretakerSettings, useSaveCaretakerSettings } from "@/hooks/useMedications"
import { useDashboardStats } from "@/hooks/useAnalytics"
import { useEffect } from "react"
import { Bell, Mail, Clock, User, Check, Loader2, AlertTriangle } from "lucide-react"

export default function NotificationSettingsForm() {
  const { data: settings, isLoading } = useCaretakerSettings()
  const { data: stats } = useDashboardStats()
  const saveSettings = useSaveCaretakerSettings()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CaretakerFormData>({
    resolver: zodResolver(caretakerSchema),
    defaultValues: {
      email: "",
      email_enabled: true,
      alerts_enabled: true,
      alert_window_hours: 2,
      daily_check_time: "20:00",
      patient_name: "Patient",
    },
  })

  const emailEnabled = watch("email_enabled")
  const alertsEnabled = watch("alerts_enabled")
  const patientName = watch("patient_name")

  // Populate form with existing settings
  useEffect(() => {
    if (settings) {
      reset({
        email: settings.email,
        email_enabled: settings.email_enabled,
        alerts_enabled: settings.alerts_enabled,
        alert_window_hours: settings.alert_window_hours,
        daily_check_time: settings.daily_check_time,
        patient_name: settings.patient_name,
      })
    }
  }, [settings, reset])

  const onSubmit = async (data: CaretakerFormData) => {
    try {
      await saveSettings.mutateAsync({
        email: data.email,
        email_enabled: data.email_enabled,
        alerts_enabled: data.alerts_enabled,
        alert_window_hours: data.alert_window_hours,
        daily_check_time: data.daily_check_time,
        patient_name: data.patient_name,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings"
      alert(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-8 justify-center">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        <span className="text-slate-500">Loading settings...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Notification Preferences Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Notification Preferences</h3>
          <p className="text-sm text-slate-500">Configure email alerts for missed medications</p>
        </div>
      </div>

      {/* Email Notifications Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
        <div>
          <p className="font-medium text-slate-800">Email Notifications</p>
          <p className="text-sm text-slate-500">Receive medication alerts via email</p>
        </div>
        <Controller
          name="email_enabled"
          control={control}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                field.value ? "bg-indigo-600" : "bg-slate-200"
              }`}
              role="switch"
              aria-checked={field.value}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                  field.value ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          )}
        />
      </div>

      {/* Email Address */}
      {emailEnabled && (
        <div className="space-y-2 px-1">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Mail className="w-4 h-4 text-slate-400" />
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="caretaker@example.com"
            className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors.email ? "border-rose-300" : "border-slate-200"
            }`}
          />
          {errors.email && (
            <p className="text-rose-600 text-sm">{errors.email.message}</p>
          )}
        </div>
      )}

      {/* Missed Medication Alerts */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-800">Missed Medication Alerts</p>
            <p className="text-sm text-slate-500">Get notified when medication is not taken on time</p>
          </div>
          <Controller
            name="alerts_enabled"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                  field.value ? "bg-indigo-600" : "bg-slate-200"
                }`}
                role="switch"
                aria-checked={field.value}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                    field.value ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            )}
          />
        </div>

        {alertsEnabled && (
          <>
            {/* Alert Window */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Alert me if medication isn&apos;t taken within
              </label>
              <select
                {...register("alert_window_hours", { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={4}>4 hours</option>
                <option value={8}>8 hours</option>
              </select>
            </div>

            {/* Daily Check Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock className="w-4 h-4 text-slate-400" />
                Daily reminder time
              </label>
              <input
                type="time"
                {...register("daily_check_time")}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-xs text-slate-500">Time to check if today&apos;s medication was taken</p>
            </div>
          </>
        )}
      </div>

      {/* Patient Name */}
      <div className="space-y-2 px-1">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <User className="w-4 h-4 text-slate-400" />
          Patient Name
        </label>
        <input
          type="text"
          {...register("patient_name")}
          placeholder="Enter patient name"
          className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors.patient_name ? "border-rose-300" : "border-slate-200"
          }`}
        />
        {errors.patient_name && (
          <p className="text-rose-600 text-sm">{errors.patient_name.message}</p>
        )}
      </div>

      {/* Email Preview */}
      {emailEnabled && alertsEnabled && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-emerald-800">Email Preview</span>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-100 text-sm">
            <p className="font-semibold text-slate-800 mb-2">
              Subject: Medication Alert - {patientName || "Patient"}
            </p>
            <p className="text-slate-600">Hello,</p>
            <p className="text-slate-600 mt-2">
              This is a reminder that <strong>{patientName || "Patient"}</strong> has not taken their medication today.
            </p>
            <p className="text-slate-600 mt-2">
              Please check with them to ensure they take their prescribed medication.
            </p>
            <p className="text-slate-500 mt-2 text-xs">
              Current adherence rate: {stats?.monthlyRate ?? 0}% ({stats?.dayStreak ?? 0}-day streak)
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        type="submit"
        disabled={isSubmitting || saveSettings.isPending}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-2"
      >
        {isSubmitting || saveSettings.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Save Notification Settings
          </>
        )}
      </button>

      {saveSettings.isSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <Check className="w-4 h-4" />
          Settings saved successfully!
        </div>
      )}
    </form>
  )
}
