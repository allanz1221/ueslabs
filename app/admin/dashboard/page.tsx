import { redirect } from "next/navigation"
import { getCurrentUser, requireRole } from "@/lib/auth-server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { LoanStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "ADMIN" && user.role !== "LAB_MANAGER") {
    redirect("/dashboard")
  }

  // Get statistics using Prisma
  const totalLoans = await prisma.loan.count()
  const pendingLoans = await prisma.loan.count({ where: { status: LoanStatus.PENDING } })
  const activeLoans = await prisma.loan.count({ where: { status: LoanStatus.PICKED_UP } })
  const totalMaterials = await prisma.material.count()

  // Get recent loans
  const recentLoans = await prisma.loan.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
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
    }
  })

  return (
    <AdminDashboard
      profile={user}
      stats={{
        totalLoans,
        pendingLoans,
        activeLoans,
        totalMaterials,
      }}
      recentLoans={recentLoans}
    />
  )
}
