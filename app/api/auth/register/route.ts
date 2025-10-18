import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, studentId } = await request.json()

    // Validar datos requeridos
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Email, contraseña, nombre y rol son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as "STUDENT" | "ADMIN" | "PROFESSOR" | "LAB_MANAGER",
        studentId: studentId || null,
        program: null, // Se puede agregar más tarde
      }
    })

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      user: userWithoutPassword
    })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
