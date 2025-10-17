"use client"

import type { Profile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FlaskConical, Package, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { StudentNav } from "./student-nav"

interface StudentDashboardProps {
  profile: Profile
  recentLoans: any[]
}

export function StudentDashboard({ profile, recentLoans }: StudentDashboardProps) {
  const pendingLoans = recentLoans.filter((loan) => loan.status === "pending").length
  const activeLoans = recentLoans.filter((loan) => loan.status === "picked_up").length
  const approvedLoans = recentLoans.filter((loan) => loan.status === "approved").length

  return (
    <div className="flex min-h-screen flex-col">
      <StudentNav profile={profile} />

      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Bienvenido, {profile.full_name}</h1>
            <p className="text-muted-foreground">ID: {profile.student_id}</p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Préstamos Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingLoans}</div>
                <p className="text-xs text-muted-foreground">Esperando aprobación</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeLoans}</div>
                <p className="text-xs text-muted-foreground">Materiales en tu poder</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Listos para Recoger</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedLoans}</div>
                <p className="text-xs text-muted-foreground">Aprobados para recoger</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Gestiona tus préstamos de materiales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start" size="lg">
                  <Link href="/student/materials">
                    <FlaskConical className="mr-2 h-5 w-5" />
                    Ver Catálogo de Materiales
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                  <Link href="/student/loans">
                    <Package className="mr-2 h-5 w-5" />
                    Mis Préstamos
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préstamos Recientes</CardTitle>
                <CardDescription>Últimas solicitudes realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLoans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tienes préstamos registrados</p>
                ) : (
                  <div className="space-y-4">
                    {recentLoans.slice(0, 3).map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{loan.loan_items?.length || 0} material(es)</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(loan.request_date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <LoanStatusBadge status={loan.status} />
                      </div>
                    ))}
                    <Button asChild variant="link" className="w-full">
                      <Link href="/student/loans">Ver todos los préstamos</Link>
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
    pending: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
    approved: { label: "Aprobado", variant: "default" as const, icon: CheckCircle2 },
    rejected: { label: "Rechazado", variant: "destructive" as const, icon: XCircle },
    picked_up: { label: "Recogido", variant: "default" as const, icon: Package },
    returned: { label: "Devuelto", variant: "outline" as const, icon: CheckCircle2 },
    overdue: { label: "Vencido", variant: "destructive" as const, icon: AlertCircle },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge variant={config.variant}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
