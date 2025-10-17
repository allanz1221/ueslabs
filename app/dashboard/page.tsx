import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Redirect based on role
  if (profile.role === "admin") {
    redirect("/admin/dashboard")
  }
  if (profile.role === "lab_manager") {
    redirect("/admin/dashboard")
  }
  if (profile.role === "professor") {
    redirect("/professor/practices")
  }
  redirect("/student/dashboard")
}
