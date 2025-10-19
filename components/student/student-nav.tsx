"use client"

import type { Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FlaskConical, User, LogOut, Package, History } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface StudentNavProps {
  profile: Profile
}

export function StudentNav({ profile }: StudentNavProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">App Laboratorio UES</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Button asChild variant="ghost">
              <Link href="/student/dashboard">Inicio</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/student/materials">Materiales</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/student/loans">Mis Préstamos</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/student/agenda">Agenda</Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell userId={profile.id} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/student/loans">
                  <Package className="mr-2 h-4 w-4" />
                  Mis Préstamos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/change-password">Cambiar contraseña</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/student/history">
                  <History className="mr-2 h-4 w-4" />
                  Historial
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
