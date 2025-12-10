import type React from "react"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>{children}</AuthGuard>
}
