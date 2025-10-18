import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { AdminUsers } from "@/components/admin/admin-users"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <AdminUsers initialUsers={users} />
}