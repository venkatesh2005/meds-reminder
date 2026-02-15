"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { RoleProvider, useRole } from "@/hooks/useRole"
import RoleSwitch from "@/components/dashboard/role-switch"
import PatientDashboard from "@/components/patient/patient-dashboard"
import CaretakerDashboard from "@/components/caretaker/caretaker-dashboard"

function DashboardContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { role } = useRole()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.replace("/login")
        return
      }

      setUserEmail(data.session.user.email ?? null)
      setIsLoading(false)
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-medium">Loading your dashboard</p>
            <p className="text-slate-400 text-sm mt-1">Just a moment...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-200/50">
              M
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900">MediCare</h1>
              <p className="text-xs text-slate-500">Your health companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <RoleSwitch />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            {userEmail && (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-sm font-medium">
                  {userEmail[0].toUpperCase()}
                </div>
                <span className="text-sm text-slate-600 max-w-[120px] truncate">{userEmail}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {role === "patient" ? <PatientDashboard /> : <CaretakerDashboard />}
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <RoleProvider>
      <DashboardContent />
    </RoleProvider>
  )
}
