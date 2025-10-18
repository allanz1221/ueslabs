import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { materials, pickupDate, returnDate, notes } = body

    // Validate input
    if (!materials || materials.length === 0) {
      return NextResponse.json({ error: "Debes seleccionar al menos un material" }, { status: 400 })
    }

    if (!pickupDate || !returnDate) {
      return NextResponse.json({ error: "Las fechas son requeridas" }, { status: 400 })
    }

    // Create loan using Prisma
    const loan = await prisma.loan.create({
      data: {
        studentId: user.id,
        expectedPickupDate: new Date(pickupDate),
        expectedReturnDate: new Date(returnDate),
        notes: notes || null,
        status: "pending",
        program: user.program,
      }
    })

    // Create loan items
    const loanItems = materials.map((item: { materialId: string; quantity: number }) => ({
      loanId: loan.id,
      materialId: item.materialId,
      quantity: item.quantity,
    }))

    await prisma.loanItem.createMany({
      data: loanItems
    })

    return NextResponse.json({ success: true, loanId: loan.id })
  } catch (error) {
    console.error("Error in loan creation:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
