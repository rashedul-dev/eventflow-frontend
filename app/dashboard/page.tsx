"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case "SUPER_ADMIN":
        case "ADMIN":
          router.replace("/dashboard/admin")
          break
        case "ORGANIZER":
          router.replace("/dashboard/organizer")
          break
        case "ATTENDEE":
        default:
          router.replace("/dashboard/attendee")
          break
      }
    }
  }, [user, isLoading, isAuthenticated, router])

  // Show loading while checking auth and redirecting
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  )
}
