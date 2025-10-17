import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminReports } from "@/components/admin/admin-reports"

export default async function AdminReportsPage() {
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

  // Get statistics for reports
  const { data: loans } = await supabase
    .from("loans")
    .select(
      `
      *,
      student:profiles!loans_student_id_fkey (*),
      loan_items (
        *,
        material:materials (*)
      )
    `,
    )
    .order("created_at", { ascending: false })

  const { data: materials } = await supabase.from("materials").select("*")

  return <AdminReports profile={profile} loans={loans || []} materials={materials || []} />
}
