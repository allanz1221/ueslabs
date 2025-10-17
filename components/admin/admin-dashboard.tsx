"use client"

import type { Profile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FlaskConical, Package, Clock, CheckCircle2, AlertCircle, Users } from "lucide-react"
import { AdminNav } from "./admin-nav"

interface AdminDashboardProps {
  profile: Profile
  stats: {
    totalLoans: number
    pendingLoans: number
    activeLoans: number
    totalMaterials: number
  }
  recentLoans: any[]
}

export function AdminDashboard({ profile, stats, recentLoans }: AdminDashboardProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav profile={profile} />

      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona préstamos y materiales del laboratorio</p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Préstamos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLoans}</div>
                <p className="text-xs text-muted-foreground">Todos los préstamos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingLoans}</div>
                <p className="text-xs text-muted-foreground">Requieren aprobación</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeLoans}</div>
                <p className="text-xs text-muted-foreground">Materiales prestados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Materiales</CardTitle>
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMaterials}</div>
                <p className="text-xs text-muted-foreground">En inventario</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Gestiona el sistema de préstamos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start" size="lg">
                  <Link href="/admin/loans">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Revisar Solicitudes Pendientes
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <Link href="/admin/materials">
                    <FlaskConical className="mr-2 h-5 w-5" />
                    Gestionar Inventario
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <Link href="/admin/students">
                    <Users className="mr-2 h-5 w-5" />
                    Ver Estudiantes
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Recientes</CardTitle>
                <CardDescription>Últimas solicitudes de préstamo</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLoans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay solicitudes recientes</p>
                ) : (
                  <div className="space-y-4">
                    {recentLoans.slice(0, 5).map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{loan.student?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {loan.loan_items?.length || 0} material(es) -{" "}
                            {new Date(loan.request_date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <LoanStatusBadge status={loan.status} />
                      </div>
                    ))}
                    <Button asChild variant="link" className="w-full">
                      <Link href="/admin/loans">Ver todas las solicitudes</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function LoanStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { label: "Pendiente", variant: "secondary" as const },
    approved: { label: "Aprobado", variant: "default" as const },
    rejected: { label: "Rechazado", variant: "destructive" as const },
    picked_up: { label: "Recogido", variant: "default" as const },
    returned: { label: "Devuelto", variant: "outline" as const },
    overdue: { label: "Vencido", variant: "destructive" as const },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

  return <Badge variant={config.variant}>{config.label}</Badge>
}
