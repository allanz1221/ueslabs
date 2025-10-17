import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type BulkUser = {
  email: string
  fullName?: string | null
  studentId?: string | null
  role?: "student" | "admin" | "lab_manager" | "professor"
  program?: "mecatronica" | "manufactura" | null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!me || me.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const body = (await request.json()) as { users: BulkUser[] }
  const users = body?.users || []

  const results: { email: string; updated: boolean; reason?: string }[] = []

  for (const u of users) {
    if (!u.email) {
      results.push({ email: "", updated: false, reason: "email vacío" })
      continue
    }
    if (u.program && !["mecatronica", "manufactura"].includes(u.program)) {
      results.push({ email: u.email, updated: false, reason: "programa inválido" })
      continue
    }
    if (u.role && !["student", "admin", "lab_manager", "professor"].includes(u.role)) {
      results.push({ email: u.email, updated: false, reason: "rol inválido" })
      continue
    }

    const update: any = {}
    if (u.fullName) update.full_name = u.fullName
    if (typeof u.studentId !== "undefined") update.student_id = u.studentId || null
    if (u.role) update.role = u.role
    if (typeof u.program !== "undefined") update.program = u.program || null

    if (Object.keys(update).length === 0) {
      results.push({ email: u.email, updated: false, reason: "sin cambios" })
      continue
    }

    const { data: profile } = await supabase.from("profiles").select("id").eq("email", u.email).single()
    if (!profile) {
      results.push({ email: u.email, updated: false, reason: "perfil no encontrado" })
      continue
    }

    const { error } = await supabase.from("profiles").update(update).eq("id", profile.id)
    if (error) {
      results.push({ email: u.email, updated: false, reason: error.message })
    } else {
      results.push({ email: u.email, updated: true })
    }
  }

  const updated = results.filter((r) => r.updated).length
  const failed = results.length - updated
  return NextResponse.json({ updated, failed, results })
}


