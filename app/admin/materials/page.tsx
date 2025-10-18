import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { AdminMaterials } from "@/components/admin/admin-materials"

export default async function AdminMaterialsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "ADMIN" && user.role !== "LAB_MANAGER") {
    redirect("/dashboard")
  }

  // Get all materials
  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" }
  })

  return <AdminMaterials profile={user} materials={materials} />
}
