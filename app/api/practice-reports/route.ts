import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!me) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 400 })

  let query = supabase
    .from("practice_reports")
    .select("*, room:rooms(*), subject:subjects(*), author:profiles!practice_reports_created_by_fkey(*)")
    .order("created_at", { ascending: false })

  if (me.role === "professor") query = query.eq("created_by", user.id)

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

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!me || me.role !== "professor") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const body = await request.json()
  const { room_id, subject_id, program, students_count, practice_name, practice_description, start_time, end_time } = body
  const { data, error } = await supabase
    .from("practice_reports")
    .insert({
      room_id,
      subject_id,
      program: program ?? me.program,
      students_count,
      practice_name,
      practice_description: practice_description ?? null,
      start_time,
      end_time,
      created_by: user.id,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })

  // Sólo el autor o admin puede borrar (RLS ya lo restringe)
  const { error } = await supabase.from("practice_reports").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

