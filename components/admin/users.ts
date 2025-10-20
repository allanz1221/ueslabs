"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { $Enums } from "@prisma/client";

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
  assignedLab: $Enums.Lab | null,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { assignedLab: assignedLab },
  });

  revalidatePath("/admin/users");
}

export async function updateUserProgram(
  userId: string,
  program: string | null,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { program: program },
  });

  revalidatePath("/admin/users");
}

export async function updateUserData(
  userId: string,
  data: {
    name?: string;
    studentId?: string | null;
    program?: string | null;
    assignedLab?: $Enums.Lab | null;
  },
) {
  await prisma.user.update({
    where: { id: userId },
    data: data,
  });

  revalidatePath("/admin/users");
}
