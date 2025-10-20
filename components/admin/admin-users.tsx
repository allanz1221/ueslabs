"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Profile, Lab } from "@/lib/types";
import { User, UserRole, Program } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Shield, Loader2 } from "lucide-react";
import {
  updateUserRole,
  updateUserAssignedLab,
  updateUserProgram,
} from "@/components/admin/users";

interface AdminUsersProps {
  initialUsers: any[];
}

export function AdminUsers({ initialUsers }: AdminUsersProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form states for new user
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [program, setProgram] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          fullName,
          studentId,
          role,
          program: program || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear usuario");
      }

      toast({
        title: "Éxito",
        description:
          "Usuario creado correctamente. Contraseña temporal: temp123456",
      });

      setIsAddDialogOpen(false);
      resetForm();
      window.location.reload();
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    try {
      await updateUserRole(userId, newRole);

      toast({
        title: "Éxito",
        description: "Rol actualizado correctamente",
      });

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
    setRole(UserRole.STUDENT);
    setProgram("");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Administra usuarios y sus roles en el sistema
          </p>
        </div>

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
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nombre y apellidos"
                />
              </div>
              <div>
                <Label htmlFor="studentId">Matrícula</Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <Label htmlFor="role">Rol *</Label>
                <Select
                  value={role}
                  onValueChange={(value: UserRole) => setRole(value)}
                >
                  <SelectTrigger>
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
              </div>
              <div>
                <Label htmlFor="program">Programa Educativo</Label>
                <Select
                  value={program}
                  onValueChange={(value) => setProgram(value)}
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
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Usuario"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
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
          <TabsTrigger value="lab-managers">
            Responsables (
            {users.filter((u) => u.role === UserRole.LAB_MANAGER).length})
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

        <TabsContent value="lab-managers" className="space-y-4">
          <UsersList
            users={users.filter((u) => u.role === UserRole.LAB_MANAGER)}
            onRoleChange={handleRoleChange}
            onAssignedLabChange={handleAssignedLabChange}
            onProgramChange={handleProgramChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface UsersListProps {
  users: any[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onAssignedLabChange: (userId: string, assignedLab: Lab | null) => void;
  onProgramChange: (userId: string, program: string | null) => void;
}

function UsersList({
  users,
  onRoleChange,
  onAssignedLabChange,
  onProgramChange,
}: UsersListProps) {
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
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {user.name || "Sin nombre"}
                  {user.role === UserRole.ADMIN && (
                    <Shield className="h-4 w-4 text-primary" />
                  )}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
                {user.studentId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Matrícula: {user.studentId}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={user.role}
                  onValueChange={(value: UserRole) =>
                    onRoleChange(user.id, value)
                  }
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label>Programa</Label>
                <Select
                  value={user.program || ""}
                  onValueChange={(value) =>
                    onProgramChange(user.id, value === "" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin programa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin programa</SelectItem>
                    <SelectItem value="MECATRONICA">Mecatrónica</SelectItem>
                    <SelectItem value="MANUFACTURA">Manufactura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {user.role === UserRole.LAB_MANAGER && (
                <div className="space-y-2">
                  <Label>Laboratorio</Label>
                  <Select
                    value={user.assignedLab || ""}
                    onValueChange={(value) =>
                      onAssignedLabChange(
                        user.id,
                        value === "" ? null : (value as Lab),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
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

            {/* Display current assignments */}
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {user.program && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {user.program === "MECATRONICA"
                    ? "Mecatrónica"
                    : "Manufactura"}
                </span>
              )}
              {user.assignedLab && user.role === UserRole.LAB_MANAGER && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {user.assignedLab === "LAB_ELECT" ? "Lab-Elect" : "Lab-Ing"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
