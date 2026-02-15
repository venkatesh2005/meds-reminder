"use client"

import { Mail, Bell, Calendar } from "lucide-react"
import { useState } from "react"

interface QuickActionsProps {
  onSendReminder?: () => void
  onConfigureNotifications?: () => void
  onViewCalendar?: () => void
}

export default function QuickActions({
  onSendReminder,
  onConfigureNotifications,
  onViewCalendar,
}: QuickActionsProps) {
  const [sending, setSending] = useState(false)

  const handleSendReminder = async () => {
    setSending(true)
    try {
      // Call edge function to send reminder
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        }
      )
      if (response.ok) {
        alert("Reminder email sent successfully!")
      } else {
        alert("Failed to send reminder email")
      }
    } catch (error) {
      alert("Error sending reminder")
    } finally {
      setSending(false)
    }
    onSendReminder?.()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>

      <div className="space-y-3">
        <button
          onClick={handleSendReminder}
          disabled={sending}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
        >
          <Mail className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700 font-medium">
            {sending ? "Sending..." : "Send Reminder Email"}
          </span>
        </button>

        <button
          onClick={onConfigureNotifications}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
        >
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700 font-medium">Configure Notifications</span>
        </button>

        <button
          onClick={onViewCalendar}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
        >
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700 font-medium">View Full Calendar</span>
        </button>
      </div>
    </div>
  )
}
