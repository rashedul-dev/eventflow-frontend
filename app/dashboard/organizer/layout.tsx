import type React from "react"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard allowedRoles={["ORGANIZER", "ADMIN", "SUPER_ADMIN"]}>{children}</AuthGuard>
}
