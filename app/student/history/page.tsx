import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudentHistory } from "@/components/student/student-history"

export default async function StudentHistoryPage() {
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

  // Get all student's loans
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

  return <StudentHistory profile={profile} loans={loans || []} />
}
