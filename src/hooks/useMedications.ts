import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabaseClient"
import {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  markMedicationTaken,
  getTodayStatus,
  getCaretakerEmail,
  saveCaretakerEmail,
  getCaretakerSettings,
  saveCaretakerSettings,
  CaretakerSettings,
} from "@/services/medicationService"
import type { Medication } from "@/types/medication"

export const useMedications = () => {
  return useQuery<Medication[], Error>({
    queryKey: ["medications"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        return []
      }

      return getMedications(user.id)
    },
  })
}

export const useAddMedication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (medication: { name: string; dosage: string; reminder_time: string }) => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        throw new Error("User not authenticated")
      }

      return addMedication(user.id, medication)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] })
    },
  })
}

export const useUpdateMedication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; dosage?: string; reminder_time?: string } }) => {
      return updateMedication(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
    },
  })
}

export const useDeleteMedication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (medicationId: string) => {
      return deleteMedication(medicationId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
      queryClient.invalidateQueries({ queryKey: ["calendarData"] })
    },
  })
}

export const useMarkTaken = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markMedicationTaken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] })
      queryClient.invalidateQueries({ queryKey: ["medicationStatus"] })
    },
  })
}

export const useMedicationStatus = (medicationIds: string[]) => {
  return useQuery({
    queryKey: ["medicationStatus", medicationIds],
    queryFn: () => getTodayStatus(medicationIds),
    enabled: medicationIds.length > 0,
  })
}

export const useCaretakerEmail = () => {
  return useQuery({
    queryKey: ["caretakerEmail"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        return null
      }

      return getCaretakerEmail(user.id)
    },
  })
}

export const useSaveCaretakerEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (email: string) => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        throw new Error("User not authenticated")
      }

      return saveCaretakerEmail(user.id, email)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caretakerEmail"] })
      queryClient.invalidateQueries({ queryKey: ["caretakerSettings"] })
    },
  })
}

export const useCaretakerSettings = () => {
  return useQuery({
    queryKey: ["caretakerSettings"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        return null
      }

      return getCaretakerSettings(user.id)
    },
  })
}

export const useSaveCaretakerSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: CaretakerSettings) => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        throw new Error("User not authenticated")
      }

      return saveCaretakerSettings(user.id, settings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caretakerEmail"] })
      queryClient.invalidateQueries({ queryKey: ["caretakerSettings"] })
    },
  })
}
