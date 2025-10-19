import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { AdminLoans } from "@/components/admin/admin-loans";

export default async function AdminLoansPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "ADMIN" && user.role !== "LAB_MANAGER") {
    redirect("/dashboard");
  }

  // Get all loans with details
  const loans = await prisma.loan.findMany({
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          studentId: true,
        },
      },
      items: {
        include: {
          material: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminLoans profile={user} loans={loans} />;
}
