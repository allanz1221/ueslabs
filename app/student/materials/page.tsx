import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MaterialCatalog } from "@/components/student/material-catalog"

export default async function MaterialsPage() {
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

  const { data: materials } = await supabase.from("materials").select("*").order("name")

  return <MaterialCatalog materials={materials || []} profile={profile} />
}
