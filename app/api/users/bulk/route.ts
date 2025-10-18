import { NextResponse } from "next/server"
import { getCurrentUser, requireRole } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

type BulkUser = {
  email: string
  fullName?: string | null
  studentId?: string | null
  role?: "STUDENT" | "ADMIN" | "LAB_MANAGER" | "PROFESSOR"
  program?: "mecatronica" | "manufactura" | null
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    
    if (user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

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
      if (u.role && !["STUDENT", "ADMIN", "LAB_MANAGER", "PROFESSOR"].includes(u.role)) {
        results.push({ email: u.email, updated: false, reason: "rol inválido" })
        continue
      }

      const update: any = {}
      if (u.fullName) update.name = u.fullName
      if (typeof u.studentId !== "undefined") update.studentId = u.studentId || null
      if (u.role) update.role = u.role
      if (typeof u.program !== "undefined") update.program = u.program || null

      if (Object.keys(update).length === 0) {
        results.push({ email: u.email, updated: false, reason: "sin cambios" })
        continue
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: u.email }
        })

        if (!existingUser) {
          results.push({ email: u.email, updated: false, reason: "usuario no encontrado" })
          continue
        }

        await prisma.user.update({
          where: { email: u.email },
          data: update
        })

        results.push({ email: u.email, updated: true })
      } catch (error) {
        results.push({ 
          email: u.email, 
          updated: false, 
          reason: error instanceof Error ? error.message : "error desconocido" 
        })
      }
    }

    const updated = results.filter((r) => r.updated).length
    const failed = results.length - updated
    return NextResponse.json({ updated, failed, results })
  } catch (error) {
    console.error("Error in bulk user update:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


