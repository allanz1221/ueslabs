"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Profile, Material } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StudentNav } from "./student-nav"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Trash2, Plus, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { createLoanRequest } from "@/app/actions/loans"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LoanRequestFormProps {
  profile: Profile
  materials: Material[]
}

interface SelectedMaterial {
  materialId: string
  quantity: number
}

export function LoanRequestForm({ profile, materials }: LoanRequestFormProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([])
  const [pickupDate, setPickupDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Load selected materials from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("selectedMaterials")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSelectedMaterials(parsed)
        sessionStorage.removeItem("selectedMaterials")
      } catch (e) {
        console.error("Error parsing selected materials:", e)
      }
    }
  }, [])

  const addMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { materialId: "", quantity: 1 }])
  }

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index))
  }

  const updateMaterial = (index: number, field: keyof SelectedMaterial, value: string | number) => {
    const updated = [...selectedMaterials]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedMaterials(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (selectedMaterials.length === 0) {
      setError("Debes seleccionar al menos un material")
      return
    }

    if (selectedMaterials.some((m) => !m.materialId)) {
      setError("Todos los materiales deben estar seleccionados")
      return
    }

    if (!pickupDate || !returnDate) {
      setError("Debes seleccionar las fechas de recogida y devolución")
      return
    }

    if (returnDate <= pickupDate) {
      setError("La fecha de devolución debe ser posterior a la fecha de recogida")
      return
    }

    // Check availability
    for (const item of selectedMaterials) {
      const material = materials.find((m) => m.id === item.materialId)
      if (!material) {
        setError("Material no encontrado")
        return
      }
      if (item.quantity > material.available_quantity) {
        setError(`No hay suficiente cantidad disponible de ${material.name}`)
        return
      }
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("pickupDate", pickupDate.toISOString())
    formData.append("returnDate", returnDate.toISOString())
    formData.append("notes", notes)
    formData.append("selectedMaterials", JSON.stringify(selectedMaterials))

    try {
      await createLoanRequest(formData)
      router.push("/student/loans")
    } catch (err) {
      console.error("Error creating loan:", err)
      setError(err instanceof Error ? err.message : "Error al crear la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StudentNav profile={profile} />

      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Nueva Solicitud de Préstamo</h1>
            <p className="text-muted-foreground">Completa el formulario para solicitar materiales</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Préstamo</CardTitle>
                <CardDescription>Selecciona los materiales y las fechas de tu préstamo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Materiales Solicitados</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Material
                    </Button>
                  </div>

                  {selectedMaterials.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <p className="text-sm text-muted-foreground">No hay materiales seleccionados</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={addMaterial}
                      >
                        Agregar Material
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedMaterials.map((item, index) => {
                        const material = materials.find((m) => m.id === item.materialId)
                        return (
                          <div key={index} className="flex gap-2">
                            <div className="flex-1">
                              <Select
                                value={item.materialId}
                                onValueChange={(value) => updateMaterial(index, "materialId", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un material" />
                                </SelectTrigger>
                                <SelectContent>
                                  {materials.map((mat) => (
                                    <SelectItem key={mat.id} value={mat.id} disabled={mat.available_quantity === 0}>
                                      {mat.name} - Disponibles: {mat.available_quantity}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                min="1"
                                max={material?.available_quantity || 1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateMaterial(index, "quantity", Number.parseInt(e.target.value) || 1)
                                }
                                placeholder="Cant."
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMaterial(index)}
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Fecha de Recogida</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !pickupDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha de Devolución</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !returnDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {returnDate ? format(returnDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={setReturnDate}
                          disabled={(date) => date < new Date() || (pickupDate && date <= pickupDate)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (Opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Agrega cualquier información adicional sobre tu solicitud..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Solicitud"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  )
}
