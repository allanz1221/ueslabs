import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminStudents } from "@/components/admin/admin-students"

export default async function AdminStudentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all students with their loan counts
  const { data: students } = await supabase.from("profiles").select("*").eq("role", "student").order("full_name")

  return <AdminStudents profile={profile} students={students || []} />
}
