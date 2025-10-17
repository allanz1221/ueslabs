import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminMaterials } from "@/components/admin/admin-materials"

export default async function AdminMaterialsPage() {
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

  // Get all materials
  const { data: materials } = await supabase.from("materials").select("*").order("name")

  return <AdminMaterials profile={profile} materials={materials || []} />
}
