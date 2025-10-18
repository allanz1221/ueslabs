import { getCurrentUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import AdminUsers from "@/components/admin/admin-users"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "ADMIN") {
    redirect("/student/dashboard")
  }

  return <AdminUsers />
}
