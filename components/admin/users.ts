"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { Lab } from "@/lib/types";

export async function updateUserRole(userId: string, newRole: UserRole) {
  if (!Object.values(UserRole).includes(newRole)) {
    throw new Error("Invalid role specified.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin/users");
}

export async function updateUserAssignedLab(
  userId: string,
  assignedLab: Lab | null,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { assignedLab: assignedLab },
  });

  revalidatePath("/admin/users");
}
