import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function AdminAgendaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile || (profile.role !== "admin" && profile.role !== "lab_manager")) redirect("/dashboard")

  const { data: rooms } = await supabase.from("rooms").select("*").order("name")
  const { data: reservations } = await supabase.from("reservations").select("*").order("start_time")

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Agenda (Administración)</h1>
      <pre className="overflow-auto rounded-md border p-4 text-xs">{JSON.stringify({ rooms, reservations }, null, 2)}</pre>
    </div>
  )
}


