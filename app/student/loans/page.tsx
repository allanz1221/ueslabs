import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { StudentLoans } from "@/components/student/student-loans"

export default async function StudentLoansPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Get all student's loans with details
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
    orderBy: { createdAt: "desc" }
  })

  return <StudentLoans profile={user} loans={loans} />
}
