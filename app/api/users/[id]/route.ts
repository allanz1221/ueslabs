import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserRole, Program, $Enums } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check if user is admin
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { name, studentId, program, assignedLab } = await request.json();
    const userId = params.id;

    // Validate program if provided
    if (program && !Object.values(Program).includes(program)) {
      return NextResponse.json(
        { error: "Programa inválido" },
        { status: 400 }
      );
    }

    // Validate assignedLab if provided
    if (assignedLab && !Object.values($Enums.Lab).includes(assignedLab)) {
      return NextResponse.json(
        { error: "Laboratorio asignado inválido" },
        { status: 400 }
      );
    }

    // Get current user data to check role
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (studentId !== undefined) updateData.studentId = studentId || null;
    if (program !== undefined) updateData.program = program || null;

    // Only update assignedLab if user is LAB_MANAGER
    if (userToUpdate.role === "LAB_MANAGER" && assignedLab !== undefined) {
      updateData.assignedLab = assignedLab || null;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
