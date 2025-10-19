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
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { assignedLab: assignedLab },
    });
  } catch (error) {
    // If assignedLab field doesn't exist yet (before DB migration), ignore the error
    console.warn("assignedLab field may not exist in database yet:", error);
    throw new Error(
      "El campo assignedLab aún no existe en la base de datos. Ejecuta la migración primero.",
    );
  }

  revalidatePath("/admin/users");
}
