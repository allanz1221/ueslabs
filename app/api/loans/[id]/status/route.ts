import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { LoanStatus } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check if user is admin or lab manager
    if (user.role !== "ADMIN" && user.role !== "LAB_MANAGER") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 },
      );
    }

    const { status, adminNotes } = await request.json();
    const loanId = params.id;

    // Validate status
    const validStatuses: LoanStatus[] = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "PICKED_UP",
      "RETURNED",
      "OVERDUE",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado de préstamo inválido" },
        { status: 400 },
      );
    }

    // Get current loan with material details
    const currentLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        items: {
          include: {
            material: {
              select: {
                lab: true,
              },
            },
          },
        },
      },
    });

    if (!currentLoan) {
      return NextResponse.json(
        { error: "Préstamo no encontrado" },
        { status: 404 },
      );
    }

    // Validate lab manager permissions
    if (user.role === "LAB_MANAGER") {
      // Skip validation if assignedLab field doesn't exist yet (before DB migration)
      if (user.assignedLab !== undefined) {
        if (!user.assignedLab) {
          return NextResponse.json(
            { error: "No tienes un laboratorio asignado" },
            { status: 403 },
          );
        }

        // Check if all materials in the loan belong to the manager's lab
        const hasPermission = currentLoan.items.every(
          (item) => item.material.lab === user.assignedLab,
        );

        if (!hasPermission) {
          return NextResponse.json(
            { error: "No tienes permisos para gestionar este préstamo" },
            { status: 403 },
          );
        }
      }
    }

    // Validate state transitions
    const canTransition = (
      currentStatus: LoanStatus,
      newStatus: LoanStatus,
    ): boolean => {
      switch (currentStatus) {
        case "PENDING":
          return newStatus === "APPROVED" || newStatus === "REJECTED";
        case "APPROVED":
          return newStatus === "PICKED_UP";
        case "PICKED_UP":
          return newStatus === "RETURNED";
        case "REJECTED":
        case "RETURNED":
          return false; // Final states
        default:
          return false;
      }
    };

    if (!canTransition(currentLoan.status, status)) {
      return NextResponse.json(
        {
          error: `No se puede cambiar el estado de ${currentLoan.status} a ${status}`,
        },
        { status: 400 },
      );
    }

    // Prepare update data
    const updateData: any = {
      status: status,
      adminNotes: adminNotes || currentLoan.adminNotes,
    };

    // Set approval fields
    if (status === "APPROVED" || status === "REJECTED") {
      updateData.approvedBy = user.id;
    }

    // Set pickup date
    if (status === "PICKED_UP") {
      updateData.actualPickupDate = new Date();
    }

    // Set return date
    if (status === "RETURNED") {
      updateData.actualReturnDate = new Date();
    }

    // Update loan
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      loan: updatedLoan,
    });
  } catch (error) {
    console.error("Error updating loan status:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
