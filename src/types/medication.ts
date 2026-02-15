export interface Medication {
  id: string
  user_id: string
  name: string
  dosage: string
  reminder_time: string
  created_at: string
}

export interface MedicationLog {
  id: string
  medication_id: string
  date: string
  taken: boolean
  taken_at: string | null
}

export interface CaretakerInfo {
  id: string
  user_id: string
  email: string
  email_enabled: boolean
  alerts_enabled: boolean
  alert_window_hours: number // 1, 2, 4, 8 hours
  daily_check_time: string // e.g., "20:00"
  patient_name: string
  created_at: string
}

export interface MedicationStatusMap {
  [medicationId: string]: boolean
}
