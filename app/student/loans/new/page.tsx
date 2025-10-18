import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { LoanRequestForm } from "@/components/student/loan-request-form"

export default async function NewLoanPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Get all materials for the form
  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" }
  })

  return <LoanRequestForm profile={user} materials={materials} />
}
