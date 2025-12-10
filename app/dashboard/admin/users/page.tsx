import { Suspense } from "react"
import { AdminUsersList } from "@/components/admin/admin-users-list"

export const metadata = {
  title: "User Management | EventFlow Admin",
  description: "Manage platform users.",
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-foreground/60 mt-1">Manage and monitor platform users.</p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
        <AdminUsersList />
      </Suspense>
    </div>
  )
}
