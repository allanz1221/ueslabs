import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { name: "asc" }
    })
    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    
    if (user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const body = await request.json()
    const { name, capacity, type, location, program, responsibleId } = body

    const room = await prisma.room.create({
      data: { 
        name, 
        capacity, 
        type, 
        location, 
        program: program ?? null, 
        responsibleId: responsibleId ?? null 
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

