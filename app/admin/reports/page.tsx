import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { AdminReports } from "@/components/admin/admin-reports"

export default async function AdminReportsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "ADMIN" && user.role !== "LAB_MANAGER") {
    redirect("/dashboard")
  }

  // Get statistics for reports
  const loans = await prisma.loan.findMany({
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          studentId: true,
        }
      },
      loanItems: {
        include: {
          material: {
            select: {
              id: true,
              name: true,
              description: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const materials = await prisma.material.findMany()

  return <AdminReports profile={user} loans={loans} materials={materials} />
}
