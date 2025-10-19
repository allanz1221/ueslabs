"use client";

import type { User, Loan, LoanItem, Material } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentNav } from "./student-nav";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  AlertCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";

type LoanWithDetails = Loan & {
  items: (LoanItem & {
    material: Material;
  })[];
};

interface StudentLoansProps {
  profile: User;
  loans: LoanWithDetails[];
}

export function StudentLoans({ profile, loans }: StudentLoansProps) {
  const pendingLoans = loans.filter((loan) => loan.status === "PENDING");
  const approvedLoans = loans.filter((loan) => loan.status === "APPROVED");
  const activeLoans = loans.filter((loan) => loan.status === "PICKED_UP");
  const completedLoans = loans.filter((loan) => loan.status === "RETURNED");
  const rejectedLoans = loans.filter((loan) => loan.status === "REJECTED");

  return (
    <div className="flex min-h-screen flex-col">
      <StudentNav profile={profile} />

      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mis Préstamos</h1>
              <p className="text-muted-foreground">
                Gestiona tus solicitudes de materiales
              </p>
            </div>
            <Button asChild>
              <Link href="/student/materials">Nueva Solicitud</Link>
            </Button>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">Todos ({loans.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pendientes ({pendingLoans.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Aprobados ({approvedLoans.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Activos ({activeLoans.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completados ({completedLoans.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Cancelados ({rejectedLoans.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <LoansList loans={loans} />
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <LoansList loans={pendingLoans} />
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <LoansList loans={approvedLoans} />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <LoansList loans={activeLoans} />
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <LoansList loans={completedLoans} />
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <LoansList loans={rejectedLoans} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function LoansList({ loans }: { loans: LoanWithDetails[] }) {
  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay préstamos</h3>
          <p className="text-sm text-muted-foreground">
            No se encontraron préstamos en esta categoría
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {loans.map((loan) => (
        <Card key={loan.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Préstamo #{loan.id.slice(0, 8)}
                  <LoanStatusBadge status={loan.status} />
                </CardTitle>
                <CardDescription>
                  Solicitado el{" "}
                  {new Date(loan.requestDate).toLocaleDateString("es-ES")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Materiales solicitados:</h4>
              <div className="space-y-1">
                {loan.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
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
                  <span>Fecha de recogida esperada</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(loan.expectedPickupDate).toLocaleDateString(
                    "es-ES",
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha de devolución esperada</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(loan.expectedReturnDate).toLocaleDateString(
                    "es-ES",
                  )}
                </p>
              </div>
            </div>

            {(loan.actualPickupDate || loan.actualReturnDate) && (
              <div className="grid gap-4 md:grid-cols-2">
                {loan.actualPickupDate && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha real de recogida</span>
                    </div>
                    <p className="text-sm font-medium text-green-600">
                      {new Date(loan.actualPickupDate).toLocaleDateString(
                        "es-ES",
                      )}
                    </p>
                  </div>
                )}

                {loan.actualReturnDate && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha real de devolución</span>
                    </div>
                    <p className="text-sm font-medium text-green-600">
                      {new Date(loan.actualReturnDate).toLocaleDateString(
                        "es-ES",
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {loan.notes && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Notas:</p>
                <p className="text-sm text-muted-foreground">{loan.notes}</p>
              </div>
            )}

            {loan.adminNotes && (
              <div className="space-y-1 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Notas del administrador:</p>
                <p className="text-sm text-muted-foreground">
                  {loan.adminNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function LoanStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
    APPROVED: {
      label: "Aprobado",
      variant: "default" as const,
      icon: CheckCircle2,
    },
    REJECTED: {
      label: "Cancelado",
      variant: "destructive" as const,
      icon: XCircle,
    },
    PICKED_UP: { label: "Activo", variant: "default" as const, icon: Package },
    RETURNED: {
      label: "Completado",
      variant: "outline" as const,
      icon: CheckCircle2,
    },
    OVERDUE: {
      label: "Vencido",
      variant: "destructive" as const,
      icon: AlertCircle,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
