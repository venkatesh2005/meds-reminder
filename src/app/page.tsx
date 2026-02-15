"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          router.replace("/dashboard")
        } else {
          router.replace("/login")
        }
      } catch (error) {
        console.error("Session check failed:", error)
        router.replace("/login")
      } finally {
        setIsChecking(false)
      }
    }

    checkUser()
  }, [router])

  if (!isChecking) {
    return null
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">MediCare</h1>
          <p className="text-slate-400 text-sm mt-1">Loading your experience...</p>
        </div>
      </div>
    </div>
  )
}
