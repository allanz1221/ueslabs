"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

const loanItemSchema = z.object({
  materialId: z.string().min(1, "Material ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
})

const createLoanSchema = z.object({
  pickupDate: z.date(),
  returnDate: z.date(),
  notes: z.string().optional(),
  selectedMaterials: z.array(loanItemSchema).min(1, "At least one material is required"),
})

export async function createLoanRequest(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const values = {
    pickupDate: new Date(formData.get("pickupDate") as string),
    returnDate: new Date(formData.get("returnDate") as string),
    notes: formData.get("notes") as string,
    selectedMaterials: JSON.parse(formData.get("selectedMaterials") as string),
  }

  const validatedData = createLoanSchema.parse(values)

  await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.create({
      data: {
        studentId: user.id,
        program: user.program,
        expectedPickupDate: validatedData.pickupDate,
        expectedReturnDate: validatedData.returnDate,
        notes: validatedData.notes,
        items: {
          create: validatedData.selectedMaterials.map((item) => ({
            materialId: item.materialId,
            quantity: item.quantity,
          })),
        },
      },
    })
  })

  revalidatePath("/student/loans")
}