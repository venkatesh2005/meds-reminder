import { z } from "zod"

export const medicationSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  reminder_time: z.string().min(1, "Reminder time is required"),
})

export type MedicationFormData = z.infer<typeof medicationSchema>

export const caretakerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  email_enabled: z.boolean(),
  alerts_enabled: z.boolean(),
  alert_window_hours: z.number().min(1).max(24),
  daily_check_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  patient_name: z.string().min(1, "Patient name is required"),
})

export type CaretakerFormData = z.infer<typeof caretakerSchema>

export const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type AuthFormData = z.infer<typeof authSchema>
