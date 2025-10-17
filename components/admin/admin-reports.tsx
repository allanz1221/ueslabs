"use client"

import type { Material, Profile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminNav } from "./admin-nav"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AdminReportsProps {
  profile: Profile
  loans: any[]
  materials: Material[]
}

export function AdminReports({ profile, loans, materials }: AdminReportsProps) {
  // Calculate statistics
  const loansByStatus = [
    { name: "Pendientes", value: loans.filter((l) => l.status === "pending").length, color: "#94a3b8" },
    { name: "Aprobados", value: loans.filter((l) => l.status === "approved").length, color: "#3b82f6" },
    { name: "Activos", value: loans.filter((l) => l.status === "picked_up").length, color: "#10b981" },
    { name: "Completados", value: loans.filter((l) => l.status === "returned").length, color: "#6366f1" },
    { name: "Rechazados", value: loans.filter((l) => l.status === "rejected").length, color: "#ef4444" },
  ]

  const materialsByCategory = materials.reduce(
    (acc, material) => {
      const existing = acc.find((item) => item.name === material.category)
      if (existing) {
        existing.total += material.total_quantity
        existing.available += material.available_quantity
      } else {
        acc.push({
          name: material.category,
          total: material.total_quantity,
          available: material.available_quantity,
          inUse: material.total_quantity - material.available_quantity,
        })
      }
      return acc
    },
    [] as Array<{ name: string; total: number; available: number; inUse: number }>,
  )

  const topMaterials = materials
    .map((m) => ({
      name: m.name,
      borrowed: m.total_quantity - m.available_quantity,
    }))
    .sort((a, b) => b.borrowed - a.borrowed)
    .slice(0, 5)

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav profile={profile} />

      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
            <p className="text-muted-foreground">Análisis del sistema de préstamos</p>
          </div>

          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Préstamos por Estado</CardTitle>
                  <CardDescription>Distribución actual de préstamos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={loansByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {loansByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Materiales por Categoría</CardTitle>
                  <CardDescription>Inventario total vs disponible</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={materialsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="available" fill="#10b981" name="Disponibles" />
                      <Bar dataKey="inUse" fill="#f59e0b" name="En Préstamo" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Materiales Más Solicitados</CardTitle>
                <CardDescription>Materiales con mayor demanda</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topMaterials} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="borrowed" fill="#3b82f6" name="Veces Prestado" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Préstamos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loans.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Materiales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{materials.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Aprobación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loans.length > 0
                      ? Math.round(
                          (loans.filter(
                            (l) => l.status === "approved" || l.status === "picked_up" || l.status === "returned",
                          ).length /
                            loans.length) *
                            100,
                        )
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Materiales en Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {materials.reduce((sum, m) => sum + (m.total_quantity - m.available_quantity), 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
