"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authSchema, AuthFormData } from "@/lib/validations"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Mail, Lock, UserPlus, AlertCircle, Loader2, Check, Sparkles } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: AuthFormData) => {
    setAuthError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setAuthError(error.message)
    } else {
      setSignupSuccess(true)
      // Depending on Supabase settings, user may need to confirm email
      // For now, redirect to dashboard
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-violet-200/50 mx-auto">
            M
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-6">Create your account</h1>
          <p className="text-slate-500 mt-2">Start your medication tracking journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-6">
          {/* Features */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Free forever
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Email reminders
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Analytics
            </div>
          </div>

          {authError && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {authError}
            </div>
          )}

          {signupSuccess && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              Account created successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                  errors.email ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.email && (
                <p className="flex items-center gap-1.5 text-rose-600 text-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Lock className="w-4 h-4 text-slate-400" />
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                  errors.password ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                }`}
              />
              {errors.password && (
                <p className="flex items-center gap-1.5 text-rose-600 text-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-slate-400">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-violet-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-500">Already a member?</span>
            </div>
          </div>

          <p className="text-center text-slate-600 text-sm">
            Have an account?{" "}
            <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
