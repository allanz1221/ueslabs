"use client"

import { useState } from "react"
import type { Profile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminNav } from "./admin-nav"
import { Search, User, Mail, Award as IdCard } from "lucide-react"

interface AdminStudentsProps {
  profile: Profile
  students: Profile[]
}

export function AdminStudents({ profile, students }: AdminStudentsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav profile={profile} />

      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Estudiantes</h1>
            <p className="text-muted-foreground">Lista de estudiantes registrados en el sistema</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {student.full_name}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="text-xs">{student.email}</span>
                    </div>
                    {student.student_id && (
                      <div className="flex items-center gap-2">
                        <IdCard className="h-3 w-3" />
                        <span className="text-xs">{student.student_id}</span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Estudiante</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No se encontraron estudiantes</h3>
                <p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
