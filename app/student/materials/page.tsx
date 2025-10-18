import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { MaterialCatalog } from "@/components/student/material-catalog"

export default async function MaterialsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" }
  })

  return <MaterialCatalog materials={materials} profile={user} />
}
