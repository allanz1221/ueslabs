import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FlaskConical, ShieldCheck, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">App Laboratorio UES</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Sistema de Préstamo de Materiales de Laboratorio
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Gestiona de manera eficiente el préstamo de equipos y materiales de laboratorio. Solicita, aprueba y realiza
            seguimiento de todos los préstamos en un solo lugar.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/register">Comenzar Ahora</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <FlaskConical className="h-10 w-10 text-primary" />
                  <CardTitle>Catálogo Completo</CardTitle>
                  <CardDescription>Accede a todo el inventario de materiales y equipos disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Consulta disponibilidad en tiempo real y solicita los materiales que necesitas para tus prácticas de
                    laboratorio.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-primary" />
                  <CardTitle>Gestión Segura</CardTitle>
                  <CardDescription>Sistema de aprobación y seguimiento de préstamos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Los administradores validan cada solicitud y mantienen un registro completo de todos los préstamos.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-10 w-10 text-primary" />
                  <CardTitle>Historial Completo</CardTitle>
                  <CardDescription>Consulta el historial de tus préstamos anteriores</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Mantén un registro de todos tus préstamos, fechas de entrega y devolución para mejor organización.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Sistema de Préstamo de Materiales de Laboratorio - Universidad
        </div>
      </footer>
    </div>
  )
}
