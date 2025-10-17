import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ProfessorPracticesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile || profile.role !== "professor") redirect("/dashboard")

  const { data: subjects } = await supabase.from("subjects").select("*").order("name")
  const { data: rooms } = await supabase.from("rooms").select("*").order("name")
  const { data: reports } = await supabase.from("practice_reports").select("*").eq("created_by", user.id).order("created_at", { ascending: false })

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Mis Reportes de Prácticas</h1>
      <pre className="overflow-auto rounded-md border p-4 text-xs">{JSON.stringify({ subjects, rooms, reports }, null, 2)}</pre>
    </div>
  )
}


