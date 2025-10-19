"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, UserPlus, Download, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Profile, Lab } from "@/lib/types";
import { User, UserRole } from "@prisma/client";
import {
  updateUserRole,
  updateUserAssignedLab,
} from "@/components/admin/users";

// Temporary type until DB migration is run
type UserWithLab = User & {
  assignedLab?: Lab | null;
};

interface AdminUsersProps {
  initialUsers: UserWithLab[];
}

export function AdminUsers({ initialUsers }: AdminUsersProps) {
  const [users, setUsers] = useState<UserWithLab[]>(initialUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState<
    "student" | "admin" | "lab_manager" | "professor"
  >("student");
  const [program, setProgram] = useState<"mecatronica" | "manufactura" | "">(
    "",
  );
  const [csvFile, setCsvFile] = useState<File | null>(null);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();

    try {
      // In a real app, you would need a server action or API route to create auth users
      // For now, we'll just show a message
      toast({
        title: "Información",
        description:
          "Los usuarios deben registrarse usando el formulario de registro. Luego puedes cambiar su rol aquí.",
      });

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el usuario",
        variant: "destructive",
      });
    }
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!csvFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await csvFile.text();
      const lines = text.split("\n").filter((line) => line.trim());

      // Skip header row
      const dataLines = lines.slice(1);

      const users = dataLines.map((line) => {
        const [email, fullName, studentId, role, program] = line
          .split(",")
          .map((s) => s.trim());
        return {
          email,
          fullName,
          studentId,
          role: (role as any) || "student",
          program: (program as any) || null,
        };
      });

      toast({
        title: "Procesando",
        description: `Se encontraron ${users.length} usuarios en el archivo CSV`,
      });

      const res = await fetch("/api/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users }),
      });
      const result = await res.json();

      toast({
        title: "Resultado",
        description: `Actualizados: ${result.updated} | Fallidos: ${result.failed}`,
      });

      setIsBulkDialogOpen(false);
      setCsvFile(null);
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast({
        title: "Error",
        description: "Error al procesar el archivo CSV",
        variant: "destructive",
      });
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    try {
      await updateUserRole(userId, newRole);

      toast({
        title: "Éxito",
        description: "Rol actualizado correctamente",
      });

      // Optimistically update UI
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      });
    }
  }

  async function handleAssignedLabChange(
    userId: string,
    assignedLab: Lab | null,
  ) {
    try {
      await updateUserAssignedLab(userId, assignedLab);

      toast({
        title: "Éxito",
        description: "Laboratorio asignado correctamente",
      });

      // Optimistically update UI
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, assignedLab } : user,
        ),
      );
    } catch (error) {
      console.error("Error updating assigned lab:", error);
      toast({
        title: "Funcionalidad Temporalmente Deshabilitada",
        description:
          "La asignación de laboratorios estará disponible después de ejecutar la migración de la base de datos.",
        variant: "destructive",
      });
    }
  }

  function resetForm() {
    setEmail("");
    setFullName("");
    setStudentId("");
    setRole("student");
  }

  function downloadTemplate() {
    const csv =
      "email,full_name,student_id,role\nejemplo@universidad.edu,Juan Pérez,2024001,student\nadmin@universidad.edu,María Admin,ADMIN01,admin";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_usuarios.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Administra usuarios y sus roles en el sistema
          </p>
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
                <DialogDescription>
                  Sube un archivo CSV con los datos de los usuarios
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div>
                  <Label>Archivo CSV</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Formato: email, nombre completo, matrícula, rol
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadTemplate}
                  className="w-full bg-transparent"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Plantilla CSV
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBulkDialogOpen(false)}
                    className="flex-1"
                  >
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
                <DialogDescription>
                  Completa los datos del nuevo usuario
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">Matrícula</Label>
                  <Input
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={role}
                    onValueChange={(value: any) => setRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.STUDENT}>
                        Estudiante
                      </SelectItem>
                      <SelectItem value={UserRole.ADMIN}>
                        Administrador
                      </SelectItem>
                      <SelectItem value={UserRole.LAB_MANAGER}>
                        Responsable de Laboratorio
                      </SelectItem>
                      <SelectItem value={UserRole.PROFESSOR}>
                        Profesor
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="program">Programa</Label>
                  <Select
                    value={program}
                    onValueChange={(value: any) => setProgram(value)}
                  >
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
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
          <TabsTrigger value="students">
            Estudiantes (
            {users.filter((u) => u.role === UserRole.STUDENT).length})
          </TabsTrigger>
          <TabsTrigger value="admins">
            Administradores (
            {users.filter((u) => u.role === UserRole.ADMIN).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <UsersList
            users={users}
            onRoleChange={handleRoleChange}
            onAssignedLabChange={handleAssignedLabChange}
          />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <UsersList
            users={users.filter((u) => u.role === UserRole.STUDENT)}
            onRoleChange={handleRoleChange}
            onAssignedLabChange={handleAssignedLabChange}
          />
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <UsersList
            users={users.filter((u) => u.role === UserRole.ADMIN)}
            onRoleChange={handleRoleChange}
            onAssignedLabChange={handleAssignedLabChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersList({
  users,
  onRoleChange,
  onAssignedLabChange,
}: {
  users: UserWithLab[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onAssignedLabChange?: (userId: string, assignedLab: Lab | null) => void;
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No hay usuarios en esta categoría
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {user.name}
                  {user.role === UserRole.ADMIN && (
                    <Shield className="h-4 w-4 text-primary" />
                  )}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select
                  value={user.role}
                  onValueChange={(value: any) => onRoleChange(user.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.STUDENT}>Estudiante</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>
                      Administrador
                    </SelectItem>
                    <SelectItem value={UserRole.LAB_MANAGER}>
                      Responsable de Laboratorio
                    </SelectItem>
                    <SelectItem value={UserRole.PROFESSOR}>Profesor</SelectItem>
                  </SelectContent>
                </Select>
                {user.role === UserRole.LAB_MANAGER && onAssignedLabChange && (
                  <Select
                    value={user.assignedLab || ""}
                    onValueChange={(value) =>
                      onAssignedLabChange(
                        user.id,
                        value === "" ? null : (value as Lab),
                      )
                    }
                    disabled={true}
                  >
                    <SelectTrigger className="w-[140px] opacity-50">
                      <SelectValue placeholder="Lab asignado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      <SelectItem value="LAB_ELECT">Lab-Elect</SelectItem>
                      <SelectItem value="LAB_ING">Lab-Ing</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm text-muted-foreground">
              {user.studentId && <p>Matrícula: {user.studentId}</p>}
              {user.role === UserRole.LAB_MANAGER && (
                <p className="text-yellow-600">
                  ⚠️ Asignación de laboratorio disponible después de migración
                  DB
                </p>
              )}
              {user.assignedLab && user.role === UserRole.LAB_MANAGER && (
                <p>
                  Laboratorio:{" "}
                  {user.assignedLab === "LAB_ELECT" ? "Lab-Elect" : "Lab-Ing"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
