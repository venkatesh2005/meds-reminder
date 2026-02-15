import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import {
  getDashboardStats,
  getCalendarData,
  DashboardStats,
  CalendarDay,
} from "@/lib/analytics"

export const useDashboardStats = () => {
  return useQuery<DashboardStats | null>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) return null

      return getDashboardStats(user.id)
    },
    staleTime: 30000,
  })
}

export const useCalendarData = (year: number, month: number) => {
  return useQuery<CalendarDay[]>({
    queryKey: ["calendarData", year, month],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) return []

      return getCalendarData(user.id, year, month)
    },
    staleTime: 30000,
  })
}
