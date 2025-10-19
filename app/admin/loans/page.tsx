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

  // Get loans with lab filtering for LAB_MANAGER
  let loansQuery: any = {
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
              lab: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  };

  // If user is LAB_MANAGER, filter loans by their assigned lab
  if (user.role === "LAB_MANAGER" && user.assignedLab) {
    loansQuery.where = {
      items: {
        some: {
          material: {
            lab: user.assignedLab,
          },
        },
      },
    };
  }

  const loans = await prisma.loan.findMany(loansQuery);

  return <AdminLoans profile={user} loans={loans} />;
}
