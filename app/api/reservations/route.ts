import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const roomId = url.searchParams.get("room_id")
    
    const where = roomId ? { roomId } : {}
    
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        room: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          }
        }
      },
      orderBy: { startTime: "asc" }
    })
    
    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const body = await request.json()
    const { roomId, startTime, endTime, reason, program } = body

    const reservation = await prisma.reservation.create({
      data: {
        roomId,
        requestedBy: user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        reason: reason ?? null,
        status: "pending",
        program: program ?? user.program ?? null
      }
    })

    return NextResponse.json(reservation)
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const body = await request.json()
    const { id, action, cancelReason } = body as { id: string; action: "approve" | "cancel"; cancelReason?: string }

    // Verificar que la reserva existe
    const reservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })

    // Sólo admin o lab_manager del mismo programa pueden aprobar/cancelar
    const authorized = user.role === "ADMIN" || 
      (user.role === "LAB_MANAGER" && user.program && reservation.program === user.program)
    
    if (!authorized) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const updateData: any = { approvedBy: user.id }
    if (action === "approve") updateData.status = "approved"
    if (action === "cancel") {
      updateData.status = "cancelled"
      updateData.cancelReason = cancelReason ?? ""
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

