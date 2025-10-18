import { getCurrentUser, requireRole } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" }
    })
    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    
    if (user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const body = await request.json()
    const { name, program, semester } = body

    const subject = await prisma.subject.create({
      data: { name, program, semester }
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

