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
import { Upload, UserPlus, Download, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Profile, Lab } from "@/lib/types";
import { User, UserRole } from "@prisma/client";
import {
  updateUserRole,
  updateUserAssignedLab,
  updateUserProgram,
  updateUserData,
} from "@/components/admin/users";

interface AdminUsersProps {
  initialUsers: any[];
}

export function AdminUsers({ initialUsers }: AdminUsersProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
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
        title: "Error",
        description: "No se pudo actualizar el laboratorio asignado",
        variant: "destructive",
      });
    }
  }

  async function handleProgramChange(userId: string, program: string | null) {
    try {
      await updateUserProgram(userId, program);

      toast({
        title: "Éxito",
        description: "Programa actualizado correctamente",
      });

      // Optimistically update UI
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, program } : user,
        ),
      );
    } catch (error) {
      console.error("Error updating program:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el programa",
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
            onProgramChange={handleProgramChange}
          />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <UsersList
            users={users.filter((u) => u.role === UserRole.STUDENT)}
            onRoleChange={handleRoleChange}
            onAssignedLabChange={handleAssignedLabChange}
            onProgramChange={handleProgramChange}
          />
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <UsersList
            users={users.filter((u) => u.role === UserRole.ADMIN)}
            onRoleChange={handleRoleChange}
            onAssignedLabChange={handleAssignedLabChange}
            onProgramChange={handleProgramChange}
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
  onProgramChange,
}: {
  users: any[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onAssignedLabChange?: (userId: string, assignedLab: Lab | null) => void;
  onProgramChange?: (userId: string, program: string | null) => void;
}) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {user.name || "Sin nombre"}
                    {user.role === UserRole.ADMIN && (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditUser(user)}
                >
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <div>
                  <span className="font-medium">Rol:</span>{" "}
                  {user.role === UserRole.STUDENT && "Estudiante"}
                  {user.role === UserRole.ADMIN && "Administrador"}
                  {user.role === UserRole.LAB_MANAGER &&
                    "Responsable de Laboratorio"}
                  {user.role === UserRole.PROFESSOR && "Profesor"}
                </div>
                {user.studentId && (
                  <div>
                    <span className="font-medium">Matrícula:</span>{" "}
                    {user.studentId}
                  </div>
                )}
                {user.program && (
                  <div>
                    <span className="font-medium">Programa:</span>{" "}
                    {user.program === "MECATRONICA"
                      ? "Mecatrónica"
                      : "Manufactura"}
                  </div>
                )}
                {user.assignedLab && user.role === UserRole.LAB_MANAGER && (
                  <div>
                    <span className="font-medium">Laboratorio:</span>{" "}
                    {user.assignedLab === "LAB_ELECT" ? "Lab-Elect" : "Lab-Ing"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onRoleChange={onRoleChange}
          onAssignedLabChange={onAssignedLabChange}
          onProgramChange={onProgramChange}
        />
      )}
    </>
  );
}

interface EditUserDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onAssignedLabChange?: (userId: string, assignedLab: Lab | null) => void;
  onProgramChange?: (userId: string, program: string | null) => void;
}

function EditUserDialog({
  user,
  open,
  onOpenChange,
  onRoleChange,
  onAssignedLabChange,
  onProgramChange,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    studentId: user.studentId || "",
    role: user.role || UserRole.STUDENT,
    program: user.program || "",
    assignedLab: user.assignedLab || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update user data via API
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar usuario");
      }

      // Update role if changed
      if (formData.role !== user.role) {
        await onRoleChange(user.id, formData.role);
      }

      // Update assigned lab if changed
      if (onAssignedLabChange && formData.assignedLab !== user.assignedLab) {
        await onAssignedLabChange(
          user.id,
          formData.assignedLab === "" ? null : (formData.assignedLab as Lab),
        );
      }

      // Update program if changed
      if (onProgramChange && formData.program !== user.program) {
        await onProgramChange(
          user.id,
          formData.program === "" ? null : formData.program,
        );
      }

      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      });

      onOpenChange(false);
      window.location.reload(); // Refresh to show changes
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica la información del usuario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@ejemplo.com"
                disabled // Email shouldn't be editable in most cases
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="studentId">Matrícula</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                placeholder="Matrícula del estudiante"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.STUDENT}>Estudiante</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={UserRole.LAB_MANAGER}>
                    Responsable de Laboratorio
                  </SelectItem>
                  <SelectItem value={UserRole.PROFESSOR}>Profesor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="program">Programa Educativo</Label>
              <Select
                value={formData.program}
                onValueChange={(value) =>
                  setFormData({ ...formData, program: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un programa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin programa</SelectItem>
                  <SelectItem value="MECATRONICA">Mecatrónica</SelectItem>
                  <SelectItem value="MANUFACTURA">Manufactura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === UserRole.LAB_MANAGER && (
              <div className="space-y-2">
                <Label htmlFor="assignedLab">Laboratorio Asignado</Label>
                <Select
                  value={formData.assignedLab}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assignedLab: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un laboratorio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    <SelectItem value="LAB_ELECT">Lab-Elect</SelectItem>
                    <SelectItem value="LAB_ING">Lab-Ing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
