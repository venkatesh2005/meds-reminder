import { ReactNode } from "react"
import QueryProvider from "@/providers/query-provider"
import "./globals.css"

export const metadata = {
  title: "Medication Reminder",
  description: "Track your medications and get reminders",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-800">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
