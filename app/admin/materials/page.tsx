import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { AdminMaterials } from "@/components/admin/admin-materials";

export default async function AdminMaterialsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "ADMIN" && user.role !== "LAB_MANAGER") {
    redirect("/dashboard");
  }

  // Get materials with lab filtering for LAB_MANAGER
  let materialsQuery: any = {
    orderBy: { name: "asc" },
  };

  // If user is LAB_MANAGER, filter materials by their assigned lab
  if (user.role === "LAB_MANAGER" && user.assignedLab) {
    materialsQuery.where = {
      lab: user.assignedLab,
    };
  }

  const materials = await prisma.material.findMany(materialsQuery);

  return <AdminMaterials profile={user} materials={materials} />;
}
