"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoading(true)
    
    if (!session?.user?.email) {
      setError("No estás autenticado")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          newPassword: password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar la contraseña")
      }

      setMessage("Contraseña actualizada correctamente")
      setPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {message && <div className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{message}</div>}
            {error && <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Actualizar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


