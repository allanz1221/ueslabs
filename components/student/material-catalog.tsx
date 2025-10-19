"use client";

import { useState } from "react";
import type { Material, Profile } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StudentNav } from "./student-nav";

interface MaterialCatalogProps {
  materials: Material[];
  profile: Profile;
}

export function MaterialCatalog({ materials, profile }: MaterialCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedMaterials, setSelectedMaterials] = useState<
    Map<string, number>
  >(new Map());
  const router = useRouter();

  // Get unique categories
  const categories = Array.from(new Set(materials.map((m) => m.category)));

  // Filter materials
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleMaterial = (materialId: string) => {
    const newSelected = new Map(selectedMaterials);
    if (newSelected.has(materialId)) {
      newSelected.delete(materialId);
    } else {
      newSelected.set(materialId, 1);
    }
    setSelectedMaterials(newSelected);
  };

  const updateQuantity = (materialId: string, quantity: number) => {
    const material = materials.find((m) => m.id === materialId);
    if (!material) return;

    const newSelected = new Map(selectedMaterials);
    if (quantity <= 0) {
      newSelected.delete(materialId);
    } else if (quantity <= material.availableQuantity) {
      newSelected.set(materialId, quantity);
    }
    setSelectedMaterials(newSelected);
  };

  const handleCreateLoan = () => {
    // Store selected materials in session storage before navigating
    const selectedItems = Array.from(selectedMaterials.entries()).map(
      ([materialId, quantity]) => ({
        materialId,
        quantity,
      }),
    );
    sessionStorage.setItem("selectedMaterials", JSON.stringify(selectedItems));
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Added StudentNav component */}
      <StudentNav profile={profile} />

      <div className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Catálogo de Materiales</h1>
            <p className="text-muted-foreground">
              Explora y solicita materiales de laboratorio
            </p>
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

          {selectedMaterials.size > 0 && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle>
                  Materiales Seleccionados ({selectedMaterials.size})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(selectedMaterials.entries()).map(
                    ([materialId, quantity]) => {
                      const material = materials.find(
                        (m) => m.id === materialId,
                      );
                      if (!material) return null;
                      return (
                        <div
                          key={materialId}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{material.name}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(materialId, quantity - 1)
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(materialId, quantity + 1)
                              }
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleMaterial(materialId)}
                            >
                              Quitar
                            </Button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild onClick={handleCreateLoan} className="w-full">
                  <Link href="/student/loans/new">
                    Crear Solicitud de Préstamo
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className={
                  selectedMaterials.has(material.id) ? "border-primary" : ""
                }
              >
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
                  <p className="mb-4 text-sm text-muted-foreground">
                    {material.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Disponibles:
                      </span>
                      <span className="font-medium">
                        {material.availableQuantity} / {material.totalQuantity}
                      </span>
                    </div>
                    {material.location && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{material.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={
                      selectedMaterials.has(material.id)
                        ? "secondary"
                        : "default"
                    }
                    className="w-full"
                    onClick={() => toggleMaterial(material.id)}
                    disabled={material.availableQuantity === 0}
                  >
                    {material.availableQuantity === 0 ? (
                      "No Disponible"
                    ) : selectedMaterials.has(material.id) ? (
                      "Seleccionado"
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Seleccionar
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No se encontraron materiales
              </h3>
              <p className="text-sm text-muted-foreground">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
