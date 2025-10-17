import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudentLoans } from "@/components/student/student-loans"

export default async function StudentLoansPage() {
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

  // Get all student's loans with details
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

  return <StudentLoans profile={profile} loans={loans || []} />
}
