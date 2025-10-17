import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoanRequestForm } from "@/components/student/loan-request-form"

export default async function NewLoanPage() {
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

  // Get all materials for the form
  const { data: materials } = await supabase.from("materials").select("*").order("name")

  return <LoanRequestForm profile={profile} materials={materials || []} />
}
