"use client"

import { useState } from "react"
import type { Profile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminNav } from "./admin-nav"
import { Clock, CheckCircle2, XCircle, Package, AlertCircle, Calendar, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AdminLoansProps {
  profile: Profile
  loans: any[]
}

export function AdminLoans({ profile, loans }: AdminLoansProps) {
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const pendingLoans = loans.filter((loan) => loan.status === "pending")
  const approvedLoans = loans.filter((loan) => loan.status === "approved")
  const activeLoans = loans.filter((loan) => loan.status === "picked_up")
  const completedLoans = loans.filter((loan) => loan.status === "returned")
  const rejectedLoans = loans.filter((loan) => loan.status === "rejected")

  const handleUpdateLoanStatus = async (loanId: string, newStatus: string) => {
    setIsProcessing(true)
    try {
      const supabase = createClient()

      const updateData: any = {
        status: newStatus,
        admin_notes: adminNotes || null,
      }

      if (newStatus === "approved" || newStatus === "rejected") {
        updateData.approved_by = profile.id
      }

      if (newStatus === "picked_up") {
        updateData.actual_pickup_date = new Date().toISOString()
      }

      if (newStatus === "returned") {
        updateData.actual_return_date = new Date().toISOString()
      }

      const { error } = await supabase.from("loans").update(updateData).eq("id", loanId)

      if (error) throw error

      setSelectedLoan(null)
      setAdminNotes("")
      router.refresh()
    } catch (error) {
      console.error("Error updating loan:", error)
      alert("Error al actualizar el préstamo")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav profile={profile} />

      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Gestión de Préstamos</h1>
            <p className="text-muted-foreground">Revisa y gestiona todas las solicitudes de préstamo</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">Pendientes ({pendingLoans.length})</TabsTrigger>
              <TabsTrigger value="approved">Aprobados ({approvedLoans.length})</TabsTrigger>
              <TabsTrigger value="active">Activos ({activeLoans.length})</TabsTrigger>
              <TabsTrigger value="completed">Completados ({completedLoans.length})</TabsTrigger>
              <TabsTrigger value="all">Todos ({loans.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <LoansList loans={pendingLoans} onSelectLoan={setSelectedLoan} showActions />
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <LoansList loans={approvedLoans} onSelectLoan={setSelectedLoan} showActions />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <LoansList loans={activeLoans} onSelectLoan={setSelectedLoan} showActions />
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <LoansList loans={completedLoans} onSelectLoan={setSelectedLoan} />
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <LoansList loans={loans} onSelectLoan={setSelectedLoan} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {selectedLoan && (
        <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gestionar Préstamo #{selectedLoan.id.slice(0, 8)}</DialogTitle>
              <DialogDescription>
                Estudiante: {selectedLoan.student?.full_name} ({selectedLoan.student?.student_id})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Materiales solicitados:</h4>
                <div className="space-y-1">
                  {selectedLoan.loan_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-muted p-2 text-sm">
                      <span>{item.material?.name}</span>
                      <Badge variant="outline">Cantidad: {item.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Fecha de recogida</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedLoan.expected_pickup_date).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fecha de devolución</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedLoan.expected_return_date).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>

              {selectedLoan.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notas del estudiante</Label>
                  <p className="text-sm">{selectedLoan.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-notes">Notas del administrador</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Agrega notas sobre esta solicitud..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              {selectedLoan.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateLoanStatus(selectedLoan.id, "rejected")}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rechazar
                  </Button>
                  <Button onClick={() => handleUpdateLoanStatus(selectedLoan.id, "approved")} disabled={isProcessing}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Aprobar
                  </Button>
                </>
              )}

              {selectedLoan.status === "approved" && (
                <Button onClick={() => handleUpdateLoanStatus(selectedLoan.id, "picked_up")} disabled={isProcessing}>
                  <Package className="mr-2 h-4 w-4" />
                  Marcar como Recogido
                </Button>
              )}

              {selectedLoan.status === "picked_up" && (
                <Button onClick={() => handleUpdateLoanStatus(selectedLoan.id, "returned")} disabled={isProcessing}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marcar como Devuelto
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function LoansList({
  loans,
  onSelectLoan,
  showActions = false,
}: {
  loans: any[]
  onSelectLoan?: (loan: any) => void
  showActions?: boolean
}) {
  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay préstamos</h3>
          <p className="text-sm text-muted-foreground">No se encontraron préstamos en esta categoría</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {loans.map((loan) => (
        <Card key={loan.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {loan.student?.full_name}
                  <LoanStatusBadge status={loan.status} />
                </CardTitle>
                <CardDescription>
                  ID: {loan.student?.student_id} • Solicitado el{" "}
                  {new Date(loan.request_date).toLocaleDateString("es-ES")}
                </CardDescription>
              </div>
              {showActions && onSelectLoan && (
                <Button size="sm" onClick={() => onSelectLoan(loan)}>
                  Gestionar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Materiales solicitados:</h4>
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
                  <span>Recogida esperada</span>
                </div>
                <p className="text-sm font-medium">{new Date(loan.expected_pickup_date).toLocaleDateString("es-ES")}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Devolución esperada</span>
                </div>
                <p className="text-sm font-medium">{new Date(loan.expected_return_date).toLocaleDateString("es-ES")}</p>
              </div>
            </div>

            {loan.notes && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Notas del estudiante:</p>
                <p className="text-sm text-muted-foreground">{loan.notes}</p>
              </div>
            )}

            {loan.admin_notes && (
              <div className="space-y-1 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Notas del administrador:</p>
                <p className="text-sm text-muted-foreground">{loan.admin_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
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
