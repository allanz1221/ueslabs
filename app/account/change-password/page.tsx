"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
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


