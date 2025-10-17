import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudentDashboard } from "@/components/student/student-dashboard"

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect("/dashboard")
  }

  // Get student's recent loans
  const { data: loans } = await supabase
    .from("loans")
    .select(
      `
      *,
      loan_items (
        *,
        material:materials (*)
      )
    `,
    )
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return <StudentDashboard profile={profile} recentLoans={loans || []} />
}
