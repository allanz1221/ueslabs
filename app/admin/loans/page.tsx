import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLoans } from "@/components/admin/admin-loans"

export default async function AdminLoansPage() {
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

  // Get all loans with details
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

  return <AdminLoans profile={profile} loans={loans || []} />
}
