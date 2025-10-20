import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserRole, Program, $Enums } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
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

    const { email, fullName, studentId, role, program } = await request.json();

    // Validate required fields
    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Email y nombre completo son requeridos" },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Rol inválido" },
        { status: 400 }
      );
    }

    // Validate program if provided
    if (program && !Object.values(Program).includes(program)) {
      return NextResponse.json(
        { error: "Programa inválido" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este email" },
        { status: 400 }
      );
    }

    // Generate a default password
    const defaultPassword = "temp123456";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name: fullName,
        studentId: studentId || null,
        role,
        program: program || null,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        program: newUser.program,
        studentId: newUser.studentId,
      },
      message: "Usuario creado correctamente. Contraseña temporal: temp123456",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
