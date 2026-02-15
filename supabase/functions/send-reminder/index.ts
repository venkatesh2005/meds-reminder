import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "npm:resend@2"

const BATCH_DELAY_MS = 500

interface Medication {
  id: string
  name: string
  dosage: string
  reminder_time: string
  user_id: string
}

interface MedicationLog {
  medication_id: string
}

interface CaretakerInfo {
  user_id: string
  email: string
  email_enabled: boolean
  alerts_enabled: boolean
  alert_window_hours: number
  daily_check_time: string
  patient_name: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Convert HH:MM time string to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const nowTime = now.toTimeString().slice(0, 5)
    const nowMinutes = timeToMinutes(nowTime)

    // Get all caretakers with notifications enabled
    const { data: caretakers, error: caretakerError } = await supabase
      .from("caretaker_info")
      .select("user_id, email, email_enabled, alerts_enabled, alert_window_hours, daily_check_time, patient_name")
      .eq("email_enabled", true)
      .eq("alerts_enabled", true)

    if (caretakerError) {
      console.error("Error fetching caretakers:", caretakerError)
      return new Response(JSON.stringify({ error: "Failed to fetch caretakers" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!caretakers || caretakers.length === 0) {
      return new Response(JSON.stringify({ message: "No caretakers with notifications enabled" }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create a map of caretaker settings by user_id
    const caretakerMap = new Map<string, CaretakerInfo>()
    caretakers.forEach((c: CaretakerInfo) => {
      caretakerMap.set(c.user_id, c)
    })

    const userIds = caretakers.map((c: CaretakerInfo) => c.user_id)

    // Get all medications for users with enabled caretakers
    const { data: meds, error: medsError } = await supabase
      .from("medications")
      .select("id, name, dosage, reminder_time, user_id")
      .in("user_id", userIds)

    if (medsError) {
      console.error("Error fetching medications:", medsError)
      return new Response(JSON.stringify({ error: "Failed to fetch medications" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!meds || meds.length === 0) {
      return new Response(JSON.stringify({ message: "No medications found" }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    const medIds = meds.map((m: Medication) => m.id)

    // Get all logs for today
    const { data: logs } = await supabase
      .from("medication_logs")
      .select("medication_id")
      .in("medication_id", medIds)
      .eq("date", today)
      .eq("taken", true)

    const takenMedIds = new Set((logs || []).map((l: MedicationLog) => l.medication_id))

    // Filter medications that should trigger alerts
    const missedMeds = meds.filter((med: Medication) => {
      // Skip if already taken
      if (takenMedIds.has(med.id)) return false

      const caretaker = caretakerMap.get(med.user_id)
      if (!caretaker) return false

      // Check if current time is past the alert window
      const reminderMinutes = timeToMinutes(med.reminder_time)
      const alertWindowMinutes = (caretaker.alert_window_hours || 2) * 60
      const alertTriggerTime = reminderMinutes + alertWindowMinutes

      // Also check if we're at or past the daily check time
      const dailyCheckMinutes = timeToMinutes(caretaker.daily_check_time || "20:00")
      
      // Alert should trigger if:
      // 1. Current time is past reminder_time + alert_window, OR
      // 2. Current time is at/past the daily check time AND reminder_time has passed
      const isPastAlertWindow = nowMinutes >= alertTriggerTime
      const isPastDailyCheck = nowMinutes >= dailyCheckMinutes && nowMinutes >= reminderMinutes

      return isPastAlertWindow || isPastDailyCheck
    })

    if (missedMeds.length === 0) {
      return new Response(JSON.stringify({ message: "No missed medications requiring alerts" }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // Group missed medications by user to send one email per user
    const missedByUser = new Map<string, Medication[]>()
    missedMeds.forEach((med: Medication) => {
      const existing = missedByUser.get(med.user_id) || []
      existing.push(med)
      missedByUser.set(med.user_id, existing)
    })

    // Send emails
    const results: { success: boolean; user_id: string; email?: string; medications?: string[]; error?: string }[] = []

    for (const [userId, medications] of missedByUser) {
      const caretaker = caretakerMap.get(userId)
      if (!caretaker) continue

      const patientName = caretaker.patient_name || "Patient"
      const medicationList = medications.map(m => `<li><strong>${m.name}</strong> (${m.dosage}) - scheduled at ${m.reminder_time}</li>`).join("")

      try {
        await resend.emails.send({
          from: "Medication Reminder <onboarding@resend.dev>",
          to: caretaker.email,
          subject: `Medication Alert - ${patientName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e293b;">Medication Alert</h2>
              <p style="color: #475569;">Hello,</p>
              <p style="color: #475569;">
                This is a reminder that <strong>${patientName}</strong> has not taken their medication today.
              </p>
              <p style="color: #475569;">Please check with them to ensure they take their prescribed medication.</p>
              
              <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e;">Missed Medications:</p>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                  ${medicationList}
                </ul>
              </div>
              
              <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">
                This alert was sent because the medication was not marked as taken within ${caretaker.alert_window_hours || 2} hour(s) of the scheduled time.
              </p>
            </div>
          `,
        })

        results.push({
          success: true,
          user_id: userId,
          email: caretaker.email,
          medications: medications.map(m => m.name),
        })

        // Delay between emails
        await sleep(BATCH_DELAY_MS)
      } catch (emailError) {
        console.error(`Failed to send email:`, emailError)
        results.push({
          success: false,
          user_id: userId,
          error: emailError instanceof Error ? emailError.message : "Unknown error",
        })

        // If rate limited, wait longer
        if (emailError instanceof Error && emailError.message.includes("429")) {
          await sleep(2000)
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reminders processed",
        sent: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        details: results,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})
