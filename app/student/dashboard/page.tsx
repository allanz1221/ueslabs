import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { StudentDashboard } from "@/components/student/student-dashboard"
import { prisma } from "@/lib/prisma"

export default async function StudentDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Get student's recent loans
  const loans = await prisma.loan.findMany({
    where: { studentId: user.id },
    include: {
      items: {
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
    orderBy: { createdAt: "desc" },
    take: 5
  })

  return <StudentDashboard profile={user} recentLoans={loans} />
}
