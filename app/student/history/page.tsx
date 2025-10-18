import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { StudentHistory } from "@/components/student/student-history"

export default async function StudentHistoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Get all student's loans
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

  return <StudentHistory profile={user} loans={loans} />
}
