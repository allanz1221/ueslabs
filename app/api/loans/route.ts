import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

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

    // Obtener perfil para leer programa
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Create loan
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .insert({
        student_id: user.id,
        expected_pickup_date: pickupDate,
        expected_return_date: returnDate,
        notes: notes || null,
        status: "pending",
        program: profile?.program ?? null,
      })
      .select()
      .single()

    if (loanError) {
      console.error("Error creating loan:", loanError)
      return NextResponse.json({ error: "Error al crear el préstamo" }, { status: 500 })
    }

    // Create loan items
    const loanItems = materials.map((item: { materialId: string; quantity: number }) => ({
      loan_id: loan.id,
      material_id: item.materialId,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase.from("loan_items").insert(loanItems)

    if (itemsError) {
      console.error("Error creating loan items:", itemsError)
      // Rollback: delete the loan
      await supabase.from("loans").delete().eq("id", loan.id)
      return NextResponse.json({ error: "Error al crear los items del préstamo" }, { status: 500 })
    }

    return NextResponse.json({ success: true, loanId: loan.id })
  } catch (error) {
    console.error("Error in loan creation:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
