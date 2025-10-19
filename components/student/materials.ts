"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Lab } from "@/lib/types";

const materialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  totalQuantity: z.number().min(0),
  location: z.string().optional(),
  lab: z.nativeEnum(Lab).optional(),
});

export async function addMaterial(formData: FormData) {
  const validatedData = materialSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    totalQuantity: Number(formData.get("total_quantity")),
    location: formData.get("location"),
    lab: formData.get("lab") as Lab | null,
  });

  await prisma.material.create({
    data: {
      ...validatedData,
      availableQuantity: validatedData.totalQuantity,
    },
  });

  revalidatePath("/admin/materials");
}

export async function updateMaterial(id: string, formData: FormData) {
  const validatedData = materialSchema
    .extend({
      availableQuantity: z.number().min(0),
    })
    .parse({
      name: formData.get("name"),
      description: formData.get("description"),
      category: formData.get("category"),
      totalQuantity: Number(formData.get("total_quantity")),
      availableQuantity: Number(formData.get("available_quantity")),
      location: formData.get("location"),
      lab: formData.get("lab") as Lab | null,
    });

  await prisma.material.update({
    where: { id },
    data: validatedData,
  });

  revalidatePath("/admin/materials");
}

export async function deleteMaterial(id: string) {
  await prisma.material.delete({ where: { id } });
  revalidatePath("/admin/materials");
}
