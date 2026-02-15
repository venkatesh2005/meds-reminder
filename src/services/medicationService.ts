import { supabase } from "@/lib/supabaseClient"
import type { Medication, MedicationLog, CaretakerInfo } from "@/types/medication"

export const getMedications = async (userId: string): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export const addMedication = async (
  userId: string,
  medication: { name: string; dosage: string; reminder_time: string }
): Promise<Medication> => {
  const { data, error } = await supabase
    .from("medications")
    .insert({
      user_id: userId,
      name: medication.name,
      dosage: medication.dosage,
      reminder_time: medication.reminder_time,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateMedication = async (
  medicationId: string,
  updates: { name?: string; dosage?: string; reminder_time?: string }
): Promise<Medication> => {
  const { data, error } = await supabase
    .from("medications")
    .update(updates)
    .eq("id", medicationId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteMedication = async (medicationId: string): Promise<void> => {
  // First delete associated logs
  await supabase
    .from("medication_logs")
    .delete()
    .eq("medication_id", medicationId)

  // Then delete the medication
  const { error } = await supabase
    .from("medications")
    .delete()
    .eq("id", medicationId)

  if (error) throw error
}

export const markMedicationTaken = async (medicationId: string): Promise<MedicationLog> => {
  const today = new Date().toISOString().split("T")[0]

  // Check if already marked today
  const { data: existing } = await supabase
    .from("medication_logs")
    .select("*")
    .eq("medication_id", medicationId)
    .eq("date", today)
    .maybeSingle()

  if (existing) {
    throw new Error("Already marked as taken today")
  }

  const { data, error } = await supabase
    .from("medication_logs")
    .insert({
      medication_id: medicationId,
      date: today,
      taken: true,
      taken_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const checkTakenToday = async (medicationId: string): Promise<boolean> => {
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("medication_logs")
    .select("taken")
    .eq("medication_id", medicationId)
    .eq("date", today)
    .maybeSingle()

  return data?.taken ?? false
}

export const getTodayStatus = async (
  medicationIds: string[]
): Promise<Record<string, boolean>> => {
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("medication_logs")
    .select("medication_id, taken")
    .in("medication_id", medicationIds)
    .eq("date", today)

  const statusMap: Record<string, boolean> = {}
  medicationIds.forEach((id) => {
    statusMap[id] = false
  })

  data?.forEach((log) => {
    if (log.taken) {
      statusMap[log.medication_id] = true
    }
  })

  return statusMap
}

export interface CaretakerSettings {
  email: string
  email_enabled: boolean
  alerts_enabled: boolean
  alert_window_hours: number
  daily_check_time: string
  patient_name: string
}

export const getCaretakerSettings = async (userId: string): Promise<CaretakerSettings | null> => {
  const { data } = await supabase
    .from("caretaker_info")
    .select("email, email_enabled, alerts_enabled, alert_window_hours, daily_check_time, patient_name")
    .eq("user_id", userId)
    .maybeSingle()

  if (!data) return null
  
  return {
    email: data.email ?? "",
    email_enabled: data.email_enabled ?? true,
    alerts_enabled: data.alerts_enabled ?? true,
    alert_window_hours: data.alert_window_hours ?? 2,
    daily_check_time: data.daily_check_time ?? "20:00",
    patient_name: data.patient_name ?? "Patient",
  }
}

export const getCaretakerEmail = async (userId: string): Promise<string | null> => {
  const { data } = await supabase
    .from("caretaker_info")
    .select("email")
    .eq("user_id", userId)
    .maybeSingle()

  return data?.email ?? null
}

export const saveCaretakerSettings = async (
  userId: string,
  settings: CaretakerSettings
): Promise<CaretakerInfo> => {
  // Check if record exists
  const { data: existing } = await supabase
    .from("caretaker_info")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  let result

  if (existing) {
    // Update existing record
    result = await supabase
      .from("caretaker_info")
      .update({
        email: settings.email,
        email_enabled: settings.email_enabled,
        alerts_enabled: settings.alerts_enabled,
        alert_window_hours: settings.alert_window_hours,
        daily_check_time: settings.daily_check_time,
        patient_name: settings.patient_name,
      })
      .eq("user_id", userId)
      .select()
      .single()
  } else {
    // Insert new record
    result = await supabase
      .from("caretaker_info")
      .insert({
        user_id: userId,
        email: settings.email,
        email_enabled: settings.email_enabled,
        alerts_enabled: settings.alerts_enabled,
        alert_window_hours: settings.alert_window_hours,
        daily_check_time: settings.daily_check_time,
        patient_name: settings.patient_name,
      })
      .select()
      .single()
  }

  if (result.error) throw result.error
  return result.data
}

export const saveCaretakerEmail = async (
  userId: string,
  email: string
): Promise<CaretakerInfo> => {
  return saveCaretakerSettings(userId, {
    email,
    email_enabled: true,
    alerts_enabled: true,
    alert_window_hours: 2,
    daily_check_time: "20:00",
    patient_name: "Patient",
  })
}
