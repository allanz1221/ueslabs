import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminDashboardPage() {
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

  // Get statistics
  const { count: totalLoans } = await supabase.from("loans").select("*", { count: "exact", head: true })

  const { count: pendingLoans } = await supabase
    .from("loans")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: activeLoans } = await supabase
    .from("loans")
    .select("*", { count: "exact", head: true })
    .eq("status", "picked_up")

  const { count: totalMaterials } = await supabase.from("materials").select("*", { count: "exact", head: true })

  // Get recent loans
  const { data: recentLoans } = await supabase
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
    .limit(5)

  return (
    <AdminDashboard
      profile={profile}
      stats={{
        totalLoans: totalLoans || 0,
        pendingLoans: pendingLoans || 0,
        activeLoans: activeLoans || 0,
        totalMaterials: totalMaterials || 0,
      }}
      recentLoans={recentLoans || []}
    />
  )
}
