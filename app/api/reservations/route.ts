import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const url = new URL(request.url)
  const roomId = url.searchParams.get("room_id")
  let query = supabase.from("reservations").select("*, room:rooms(*), requester:profiles!reservations_requested_by_fkey(*)").order("start_time")
  if (roomId) query = query.eq("room_id", roomId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 400 })

  const body = await request.json()
  const { room_id, start_time, end_time, reason, program } = body
  const { data, error } = await supabase
    .from("reservations")
    .insert({ room_id, requested_by: user.id, start_time, end_time, reason: reason ?? null, status: "pending", program: program ?? profile.program ?? null })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!me) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 400 })

  const body = await request.json()
  const { id, action, cancel_reason } = body as { id: string; action: "approve" | "cancel"; cancel_reason?: string }

  // Sólo admin o lab_manager del mismo programa pueden aprobar/cancelar
  const { data: reservation } = await supabase.from("reservations").select("*").eq("id", id).single()
  if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })

  const authorized = me.role === "admin" || (me.role === "lab_manager" && me.program && reservation.program === me.program)
  if (!authorized) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const update: any = { approved_by: user.id }
  if (action === "approve") update.status = "approved"
  if (action === "cancel") {
    update.status = "cancelled"
    update.cancel_reason = cancel_reason ?? ""
  }

  const { data, error } = await supabase.from("reservations").update(update).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

