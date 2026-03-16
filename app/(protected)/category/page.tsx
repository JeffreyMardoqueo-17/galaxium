"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Loader2, Plus, Search, Shapes, Tag } from "lucide-react";

import { createCategory, getCategories } from "@/services/category.service";
import type { CategoryRead } from "@/types/category";

import { showToast } from "@/components/ui/modales/Toast";
import { isUnauthorizedError } from "@/utils/getAddHeaders";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export default function CategoryPage() {
  const router = useRouter();

  const [categories, setCategories] = React.useState<CategoryRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data ?? []);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente para continuar.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      const message = error instanceof Error ? error.message : "No se pudieron cargar las categorias";
      showToast({
        title: "Error al cargar",
        description: message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paged = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const resetForm = () => setName("");

  const onCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast({
        title: "Nombre requerido",
        description: "Ingresa un nombre para la categoria.",
        color: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      await createCategory({ name: trimmed });
      showToast({
        title: "Categoria creada",
        description: "La categoria fue registrada correctamente.",
        color: "success",
      });
      setOpen(false);
      resetForm();
      await load();
      setPage(1);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente para continuar.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      const message = error instanceof Error ? error.message : "No se pudo crear la categoria";
      showToast({
        title: "Error al guardar",
        description: message,
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const goToPage = (target: number) => {
    if (target < 1 || target > totalPages) return;
    setPage(target);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Card>
          <CardContent className="flex h-40 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando categorias...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total categorias</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="text-3xl font-semibold tracking-tight">{categories.length}</span>
            <Shapes className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resultados filtrados</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="text-3xl font-semibold tracking-tight">{total}</span>
            <Search className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagina actual</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="text-3xl font-semibold tracking-tight">{currentPage}</span>
            <Tag className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estado</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="text-3xl font-semibold tracking-tight">Activo</span>
            <FolderOpen className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Categorias de productos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Organiza el catalogo con categorias limpias y listas para operar.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar categoria..."
                className="pl-9"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Dialog
              open={open}
              onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva categoria
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear categoria</DialogTitle>
                  <DialogDescription>Registra una nueva categoria para clasificar productos.</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                  <label className="text-sm font-medium" htmlFor="category-name">
                    Nombre
                  </label>
                  <Input
                    id="category-name"
                    placeholder="Ej: Lacteos"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void onCreate();
                      }
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={() => void onCreate()} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      No se encontraron categorias para el filtro actual.
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.code || "N/A"}</TableCell>
                      <TableCell>{category.createdAt ? new Date(category.createdAt).toLocaleDateString("es-SV") : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Disponible
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * PAGE_SIZE + (paged.length ? 1 : 0)} - {(currentPage - 1) * PAGE_SIZE + paged.length} de {total}
            </p>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                Anterior
              </Button>
              <span className="min-w-24 text-center text-sm text-muted-foreground">
                Pagina {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
