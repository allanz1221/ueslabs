import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminUsers from "@/components/admin/admin-users"

export default async function AdminUsersPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/student/dashboard")
  }

  return <AdminUsers />
}
