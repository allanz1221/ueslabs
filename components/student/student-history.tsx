"use client"

import type { Profile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentNav } from "./student-nav"
import { Clock, CheckCircle2, XCircle, Package, AlertCircle, Calendar } from "lucide-react"

interface StudentHistoryProps {
  profile: Profile
  loans: any[]
}

export function StudentHistory({ profile, loans }: StudentHistoryProps) {
  const completedLoans = loans.filter((loan) => loan.status === "returned")
  const rejectedLoans = loans.filter((loan) => loan.status === "rejected")

  return (
    <div className="flex min-h-screen flex-col">
      <StudentNav profile={profile} />

      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Historial de Préstamos</h1>
            <p className="text-muted-foreground">Consulta todos tus préstamos anteriores</p>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Préstamos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loans.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedLoans.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rejectedLoans.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {loans.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No hay historial</h3>
                  <p className="text-sm text-muted-foreground">Aún no has realizado ningún préstamo</p>
                </CardContent>
              </Card>
            ) : (
              loans.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Préstamo #{loan.id.slice(0, 8)}
                          <LoanStatusBadge status={loan.status} />
                        </CardTitle>
                        <CardDescription>
                          Solicitado el {new Date(loan.request_date).toLocaleDateString("es-ES")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Materiales:</h4>
                      <div className="space-y-1">
                        {loan.loan_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span>{item.material?.name}</span>
                            <Badge variant="outline">Cantidad: {item.quantity}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Fecha de recogida</span>
                        </div>
                        <p className="text-sm font-medium">
                          {loan.actual_pickup_date
                            ? new Date(loan.actual_pickup_date).toLocaleDateString("es-ES")
                            : new Date(loan.expected_pickup_date).toLocaleDateString("es-ES")}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Fecha de devolución</span>
                        </div>
                        <p className="text-sm font-medium">
                          {loan.actual_return_date
                            ? new Date(loan.actual_return_date).toLocaleDateString("es-ES")
                            : new Date(loan.expected_return_date).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>

                    {loan.admin_notes && (
                      <div className="space-y-1 rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium">Notas del administrador:</p>
                        <p className="text-sm text-muted-foreground">{loan.admin_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
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
