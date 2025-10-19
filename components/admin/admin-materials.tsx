"use client"

import type React from "react"

import { useState } from "react"
import type { Material, Profile } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminNav } from "./admin-nav"
import { Search, Package, MapPin, Plus, Pencil, Trash2, AlertCircle, Loader2 } from "lucide-react"
import { addMaterial, updateMaterial, deleteMaterial } from "@/components/student/materials"

interface AdminMaterialsProps {
  profile: Profile
  materials: Material[]
}

export function AdminMaterials({ profile, materials }: AdminMaterialsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

  const categories = Array.from(new Set(materials.map((m) => m.category)))

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || material.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (materialId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este material?")) return

    try {
      await deleteMaterial(materialId)
    } catch (error) {
      console.error("Error deleting material:", error)
      alert("Error al eliminar el material")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav profile={profile} />

      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
              <p className="text-muted-foreground">Administra los materiales de laboratorio</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Material
            </Button>
          </div>

          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar materiales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{material.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {material.category}
                      </Badge>
                    </div>
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">{material.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{material.total_quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Disponibles:</span>
                      <span className="font-medium">{material.available_quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">En préstamo:</span>
                      <span className="font-medium">{material.total_quantity - material.available_quantity}</span>
                    </div>
                    {material.location && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{material.location}</span>
                      </div>
                    )}
                  </div>
                  {material.available_quantity === 0 && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>Sin stock disponible</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEdit(material)}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(material.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No se encontraron materiales</h3>
                <p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <AddMaterialDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      {selectedMaterial && (
        <EditMaterialDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} material={selectedMaterial} />
      )}
    </div>
  )
}

function AddMaterialDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    total_quantity: 0,
    available_quantity: 0,
    location: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const form = new FormData(e.target as HTMLFormElement)
      await addMaterial(form)
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding material:", error)
      setError(error instanceof Error ? error.message : "Error al agregar el material")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Material</DialogTitle>
          <DialogDescription>Completa la información del material de laboratorio</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  required
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Input
                  id="category"
                  required
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="total_quantity">Cantidad Total *</Label>
                <Input
                  id="total_quantity"
                  type="number"
                  min="0"
                  required
                  name="total_quantity"
                  value={formData.total_quantity}
                  onChange={(e) => setFormData({ ...formData, total_quantity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Agregando...</>
              ) : (
                "Agregar Material"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditMaterialDialog({
  open,
  onOpenChange,
  material,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: Material
}) {
  const [formData, setFormData] = useState({
    name: material.name,
    description: material.description || "",
    category: material.category,
    total_quantity: material.total_quantity,
    available_quantity: material.available_quantity,
    location: material.location || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const form = new FormData(e.target as HTMLFormElement)
      await updateMaterial(material.id, form)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating material:", error)
      setError(error instanceof Error ? error.message : "Error al actualizar el material")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
          <DialogDescription>Actualiza la información del material</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  required
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoría *</Label>
                <Input
                  id="edit-category"
                  required
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-total">Cantidad Total *</Label>
                <Input
                  id="edit-total"
                  type="number"
                  min="0"
                  required
                  name="total_quantity"
                  value={formData.total_quantity}
                  onChange={(e) => setFormData({ ...formData, total_quantity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-available">Disponibles *</Label>
                <Input
                  id="edit-available"
                  type="number"
                  min="0"
                  max={formData.total_quantity}
                  required
                  name="available_quantity"
                  value={formData.available_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, available_quantity: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Ubicación</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
