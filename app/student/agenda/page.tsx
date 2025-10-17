import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function StudentAgendaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile || profile.role !== "student") redirect("/dashboard")

  // Rooms y reservas aprobadas para mostrar disponibilidad
  const { data: rooms } = await supabase.from("rooms").select("*").order("name")
  const { data: reservations } = await supabase
    .from("reservations")
    .select("*")
    .eq("status", "approved")

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Agenda</h1>
      <p className="mb-4 text-sm text-muted-foreground">Vista de disponibilidad por sala.</p>
      <pre className="overflow-auto rounded-md border p-4 text-xs">{JSON.stringify({ rooms, reservations }, null, 2)}</pre>
    </div>
  )
}


