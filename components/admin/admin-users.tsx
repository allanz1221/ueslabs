"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, UserPlus, Download, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Profile } from "@/lib/types"
import { updateUserRole } from "@/app/actions/users"

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const supabase = createBrowserClient()
  const { toast } = useToast()

  // Form states
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [role, setRole] = useState<"student" | "admin" | "lab_manager" | "professor">("student")
  const [program, setProgram] = useState<"mecatronica" | "manufactura" | "">("")
  const [csvFile, setCsvFile] = useState<File | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()

    try {
      // In a real app, you would need a server action or API route to create auth users
      // For now, we'll just show a message
      toast({
        title: "Información",
        description:
          "Los usuarios deben registrarse usando el formulario de registro. Luego puedes cambiar su rol aquí.",
      })

      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el usuario",
        variant: "destructive",
      })
    }
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault()

    if (!csvFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV",
        variant: "destructive",
      })
      return
    }

    try {
      const text = await csvFile.text()
      const lines = text.split("\n").filter((line) => line.trim())

      // Skip header row
      const dataLines = lines.slice(1)

      const users = dataLines.map((line) => {
        const [email, fullName, studentId, role, program] = line.split(",").map((s) => s.trim())
        return { email, fullName, studentId, role: (role as any) || "student", program: (program as any) || null }
      })

      toast({
        title: "Procesando",
        description: `Se encontraron ${users.length} usuarios en el archivo CSV`,
      })

      const res = await fetch("/api/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users }),
      })
      const result = await res.json()

      toast({ title: "Resultado", description: `Actualizados: ${result.updated} | Fallidos: ${result.failed}` })

      setIsBulkDialogOpen(false)
      setCsvFile(null)
    } catch (error) {
      console.error("Error processing CSV:", error)
      toast({
        title: "Error",
        description: "Error al procesar el archivo CSV",
        variant: "destructive",
      })
    }
  }

  async function handleRoleChange(userId: string, newRole: any) {
    try {
      await updateUserRole(userId, newRole)

      toast({
        title: "Éxito",
        description: "Rol actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      })
    }
  }

  function resetForm() {
    setEmail("")
    setFullName("")
    setStudentId("")
    setRole("student")
  }

  function downloadTemplate() {
    const csv =
      "email,full_name,student_id,role\nejemplo@universidad.edu,Juan Pérez,2024001,student\nadmin@universidad.edu,María Admin,ADMIN01,admin"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla_usuarios.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">Administra usuarios y sus roles en el sistema</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Carga Masiva
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Carga Masiva de Usuarios</DialogTitle>
                <DialogDescription>Sube un archivo CSV con los datos de los usuarios</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div>
                  <Label>Archivo CSV</Label>
                  <Input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} required />
                  <p className="text-sm text-muted-foreground mt-2">Formato: email, nombre completo, matrícula, rol</p>
                </div>
                <Button type="button" variant="outline" onClick={downloadTemplate} className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Plantilla CSV
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Procesar CSV
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
                <DialogDescription>Completa los datos del nuevo usuario</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="studentId">Matrícula</Label>
                  <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select value={role} onValueChange={(value: any) => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="lab_manager">Responsable de Laboratorio</SelectItem>
                      <SelectItem value="professor">Profesor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="program">Programa</Label>
                  <Select value={program} onValueChange={(value: any) => setProgram(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin programa</SelectItem>
                      <SelectItem value="mecatronica">Mecatrónica</SelectItem>
                      <SelectItem value="manufactura">Manufactura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Agregar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos ({users.length})</TabsTrigger>
          <TabsTrigger value="students">Estudiantes ({users.filter((u) => u.role === "student").length})</TabsTrigger>
          <TabsTrigger value="admins">Administradores ({users.filter((u) => u.role === "admin").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <UsersList users={users} onRoleChange={handleRoleChange} />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <UsersList users={users.filter((u) => u.role === "student")} onRoleChange={handleRoleChange} />
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <UsersList users={users.filter((u) => u.role === "admin")} onRoleChange={handleRoleChange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function UsersList({
  users,
  onRoleChange,
}: {
  users: Profile[],
  onRoleChange: (userId: string, newRole: "student" | "admin" | "lab_manager" | "professor") => void
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No hay usuarios en esta categoría</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {user.full_name}
                  {user.role === "admin" && <Shield className="h-4 w-4 text-primary" />}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <Select value={user.role} onValueChange={(value: any) => onRoleChange(user.id, value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="lab_manager">Responsable de Laboratorio</SelectItem>
                  <SelectItem value="professor">Profesor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          {user.student_id && (
            <CardContent>
              <p className="text-sm text-muted-foreground">Matrícula: {user.student_id}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
