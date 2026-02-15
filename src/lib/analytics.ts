import { supabase } from "@/lib/supabaseClient"

export interface DashboardStats {
  dayStreak: number
  todayStatus: "taken" | "pending" | "missed"
  monthlyRate: number
  weeklyTaken: number
  missedThisMonth: number
  takenThisMonth: number
  totalMedications: number
}

export interface CalendarDay {
  date: string
  status: "taken" | "missed" | "pending" | "future"
}

// Helper to format date as YYYY-MM-DD without timezone issues
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Get the current streak of consecutive days with all medications taken
export const calculateStreak = async (userId: string): Promise<number> => {
  const { data: medications } = await supabase
    .from("medications")
    .select("id, created_at")
    .eq("user_id", userId)

  if (!medications?.length) return 0

  const medIds = medications.map((m) => m.id)
  // Get earliest medication creation date
  const earliestCreated = medications.reduce((min, m) => {
    const d = formatDate(new Date(m.created_at))
    return d < min ? d : min
  }, formatDate(new Date()))

  const today = new Date()
  let streak = 0

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = formatDate(checkDate)

    // Don't count days before medications were created
    if (dateStr < earliestCreated) break

    const { data: logs } = await supabase
      .from("medication_logs")
      .select("medication_id, taken")
      .in("medication_id", medIds)
      .eq("date", dateStr)
      .eq("taken", true)

    const takenCount = logs?.length ?? 0

    if (takenCount === medIds.length) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

// Get today's medication status
export const getTodayStatus = async (
  userId: string
): Promise<"taken" | "pending" | "missed"> => {
  const today = formatDate(new Date())
  const currentTime = new Date().toTimeString().slice(0, 5)

  const { data: medications } = await supabase
    .from("medications")
    .select("id, reminder_time")
    .eq("user_id", userId)

  if (!medications?.length) return "pending"

  const medIds = medications.map((m) => m.id)

  const { data: logs } = await supabase
    .from("medication_logs")
    .select("medication_id, taken")
    .in("medication_id", medIds)
    .eq("date", today)
    .eq("taken", true)

  const takenCount = logs?.length ?? 0

  if (takenCount === medications.length) return "taken"

  // Check if any medication time has passed
  const hasMissed = medications.some((med) => med.reminder_time < currentTime)
  const allTakenOrFuture = medications.every(
    (med) => med.reminder_time > currentTime || logs?.some((l) => l.medication_id === med.id)
  )

  if (hasMissed && !allTakenOrFuture) return "missed"
  return "pending"
}

// Get monthly adherence rate
export const getMonthlyAdherence = async (userId: string): Promise<number> => {
  const now = new Date()
  const today = new Date()
  const todayStr = formatDate(today)

  const { data: medications } = await supabase
    .from("medications")
    .select("id, created_at")
    .eq("user_id", userId)

  if (!medications?.length) return 0

  const medIds = medications.map((m) => m.id)
  // Get earliest medication creation date
  const earliestCreated = medications.reduce((min, m) => {
    const d = formatDate(new Date(m.created_at))
    return d < min ? d : min
  }, todayStr)

  const daysInMonth = today.getDate()
  let takenDays = 0
  let countableDays = 0

  for (let i = 1; i <= daysInMonth; i++) {
    const checkDate = new Date(now.getFullYear(), now.getMonth(), i)
    const dateStr = formatDate(checkDate)

    // Skip days before medications were created
    if (dateStr < earliestCreated) continue
    countableDays++

    const { data: logs } = await supabase
      .from("medication_logs")
      .select("medication_id")
      .in("medication_id", medIds)
      .eq("date", dateStr)
      .eq("taken", true)

    if ((logs?.length ?? 0) === medIds.length) {
      takenDays++
    }
  }

  if (countableDays === 0) return 0
  return Math.round((takenDays / countableDays) * 100)
}

// Get weekly taken count
export const getWeeklyTaken = async (userId: string): Promise<number> => {
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)

  const { data: medications } = await supabase
    .from("medications")
    .select("id")
    .eq("user_id", userId)

  if (!medications?.length) return 0

  const medIds = medications.map((m) => m.id)

  const { data: logs } = await supabase
    .from("medication_logs")
    .select("medication_id, date")
    .in("medication_id", medIds)
    .gte("date", formatDate(weekAgo))
    .lte("date", formatDate(today))
    .eq("taken", true)

  // Count unique days with all meds taken
  const daysTaken = new Set<string>()
  const logsByDate = new Map<string, number>()

  logs?.forEach((log) => {
    const count = logsByDate.get(log.date) ?? 0
    logsByDate.set(log.date, count + 1)
  })

  logsByDate.forEach((count, date) => {
    if (count === medIds.length) {
      daysTaken.add(date)
    }
  })

  return daysTaken.size
}

// Get missed and taken count this month
export const getMonthlyDayCounts = async (userId: string): Promise<{ taken: number; missed: number }> => {
  const now = new Date()
  const today = new Date()
  const todayStr = formatDate(today)

  const { data: medications } = await supabase
    .from("medications")
    .select("id, created_at")
    .eq("user_id", userId)

  if (!medications?.length) return { taken: 0, missed: 0 }

  const medIds = medications.map((m) => m.id)
  // Get earliest medication creation date
  const earliestCreated = medications.reduce((min, m) => {
    const d = formatDate(new Date(m.created_at))
    return d < min ? d : min
  }, todayStr)

  const daysInMonth = today.getDate()
  let missedDays = 0
  let takenDays = 0

  for (let i = 1; i <= daysInMonth; i++) {
    const checkDate = new Date(now.getFullYear(), now.getMonth(), i)
    const dateStr = formatDate(checkDate)

    // Skip days before medications were created
    if (dateStr < earliestCreated) continue

    const { data: logs } = await supabase
      .from("medication_logs")
      .select("medication_id")
      .in("medication_id", medIds)
      .eq("date", dateStr)
      .eq("taken", true)

    if ((logs?.length ?? 0) === medIds.length) {
      takenDays++
    } else if (dateStr < todayStr) {
      // Only count as missed if it's a past day
      missedDays++
    }
  }

  return { taken: takenDays, missed: missedDays }
}

// Get calendar data for month
export const getCalendarData = async (
  userId: string,
  year: number,
  month: number
): Promise<CalendarDay[]> => {
  const { data: medications } = await supabase
    .from("medications")
    .select("id, created_at")
    .eq("user_id", userId)

  if (!medications?.length) return []

  const medIds = medications.map((m) => m.id)
  // Get earliest medication creation date
  const earliestCreated = medications.reduce((min, m) => {
    const d = formatDate(new Date(m.created_at))
    return d < min ? d : min
  }, formatDate(new Date()))

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const todayStr = formatDate(today)
  const result: CalendarDay[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const checkDate = new Date(year, month, day)
    const dateStr = formatDate(checkDate)

    if (dateStr > todayStr) {
      result.push({ date: dateStr, status: "future" })
      continue
    }

    // Days before medications were created are treated as future (no data)
    if (dateStr < earliestCreated) {
      result.push({ date: dateStr, status: "future" })
      continue
    }

    const { data: logs } = await supabase
      .from("medication_logs")
      .select("medication_id")
      .in("medication_id", medIds)
      .eq("date", dateStr)
      .eq("taken", true)

    const takenCount = logs?.length ?? 0

    if (takenCount === medIds.length) {
      result.push({ date: dateStr, status: "taken" })
    } else if (dateStr === todayStr) {
      result.push({ date: dateStr, status: "pending" })
    } else {
      result.push({ date: dateStr, status: "missed" })
    }
  }

  return result
}

// Get all dashboard stats
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  const [dayStreak, todayStatus, monthlyRate, weeklyTaken, monthlyDayCounts] = await Promise.all([
    calculateStreak(userId),
    getTodayStatus(userId),
    getMonthlyAdherence(userId),
    getWeeklyTaken(userId),
    getMonthlyDayCounts(userId),
  ])

  const { data: medications } = await supabase
    .from("medications")
    .select("id")
    .eq("user_id", userId)

  return {
    dayStreak,
    todayStatus,
    monthlyRate,
    weeklyTaken,
    missedThisMonth: monthlyDayCounts.missed,
    takenThisMonth: monthlyDayCounts.taken,
    totalMedications: medications?.length ?? 0,
  }
}
