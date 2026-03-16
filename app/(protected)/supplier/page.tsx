"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, MapPin, Phone, RefreshCcw, Search, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/modales/Toast";
import { createSupplier, getSuppliers, updateSupplier } from "@/services/supplier.service";
import { SupplierResponse } from "@/types/supplier";
import { formatDate } from "@/utils/formatDate";
import { isUnauthorizedError } from "@/utils/getAddHeaders";

type ComboboxOption = { id: string; label: string };

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function SupplierPage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = React.useState<SupplierResponse[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [busySupplierId, setBusySupplierId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [selectedStateId, setSelectedStateId] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setSuppliers(await getSuppliers());
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

      setError(getErrorMessage(error, "No se pudo cargar el directorio de proveedores"));
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    if (!form.name.trim()) {
      showToast({
        title: "Nombre requerido",
        description: "Ingresa el nombre del proveedor para registrarlo.",
        color: "warning",
      });
      return;
    }

    setSaving(true);

    try {
      await createSupplier({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
      });

      setForm({ name: "", phone: "", email: "", address: "" });

      showToast({
        title: "Proveedor registrado",
        description: "El proveedor fue creado correctamente.",
        color: "success",
      });

      await load();
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

      showToast({
        title: "No se pudo crear el proveedor",
        description: getErrorMessage(error, "Operacion rechazada por el servidor."),
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(supplier: SupplierResponse) {
    setBusySupplierId(supplier.id);

    try {
      await updateSupplier(supplier.id, {
        name: supplier.name,
        phone: supplier.phone ?? undefined,
        email: supplier.email ?? undefined,
        address: supplier.address ?? undefined,
        isActive: !supplier.isActive,
      });

      showToast({
        title: supplier.isActive ? "Proveedor desactivado" : "Proveedor activado",
        description: "El estado del proveedor fue actualizado correctamente.",
        color: "success",
      });

      await load();
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

      showToast({
        title: "No se pudo cambiar el estado",
        description: getErrorMessage(error, "Operacion rechazada por el servidor."),
        color: "danger",
      });
    } finally {
      setBusySupplierId(null);
    }
  }

  const stateOptions = React.useMemo<ComboboxOption[]>(
    () => [
      { id: "", label: "Todos los estados" },
      { id: "active", label: "Activos" },
      { id: "inactive", label: "Inactivos" },
    ],
    []
  );

  const selectedState = React.useMemo(() => {
    return stateOptions.find((option) => option.id === selectedStateId) ?? stateOptions[0] ?? null;
  }, [selectedStateId, stateOptions]);

  const filteredSuppliers = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !term ||
        [supplier.name, supplier.email ?? "", supplier.phone ?? "", supplier.address ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesState =
        !selectedStateId ||
        (selectedStateId === "active" && supplier.isActive) ||
        (selectedStateId === "inactive" && !supplier.isActive);

      return matchesSearch && matchesState;
    });
  }, [search, selectedStateId, suppliers]);

  const activeSuppliers = React.useMemo(() => suppliers.filter((supplier) => supplier.isActive).length, [suppliers]);

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Truck className="h-3.5 w-3.5" />
                Cadena de abastecimiento
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Proveedores</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Mantiene actualizado el directorio de aliados comerciales con sus datos de contacto y disponibilidad.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Registrados</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{suppliers.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Activos</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{activeSuppliers}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Inactivos</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{suppliers.length - activeSuppliers}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Nuevo proveedor
              </CardTitle>
              <CardDescription>Registra los datos esenciales para futuras compras y alertas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nombre comercial</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Distribuidora Central"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Telefono</label>
                <Input
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="7777-7777"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Correo</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="compras@proveedor.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Direccion</label>
                <Textarea
                  value={form.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Zona industrial, bodega 4"
                />
              </div>

              <Button className="w-full" onClick={() => void handleCreate()} disabled={saving}>
                {saving ? "Guardando..." : "Registrar proveedor"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Directorio de proveedores
              </CardTitle>
              <CardDescription>Consulta estado, canales de contacto y antiguedad de cada proveedor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_240px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar por nombre, correo o telefono"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <Combobox
                  items={stateOptions}
                  value={selectedState}
                  onValueChange={(option: ComboboxOption | null) => setSelectedStateId(option?.id ?? "")}
                  itemToStringLabel={(option) => option?.label ?? ""}
                  itemToStringValue={(option) => option?.id ?? ""}
                >
                  <ComboboxInput placeholder="Estado" showClear />
                  <ComboboxContent className="z-50">
                    <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                    <ComboboxList>
                      {(option: ComboboxOption) => (
                        <ComboboxItem key={option.id || "all-supplier-states"} value={option}>
                          {option.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                <Button variant="outline" onClick={() => void load()} disabled={loading}>
                  <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Recargar
                </Button>
              </div>

              {error ? (
                <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Direccion</TableHead>
                    <TableHead>Alta</TableHead>
                    <TableHead className="text-right">Accion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => {
                    const busy = busySupplierId === supplier.id;

                    return (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div className="space-y-2">
                            <p className="font-medium text-foreground">{supplier.name}</p>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                supplier.isActive
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-rose-200 bg-rose-50 text-rose-700"
                              }`}
                            >
                              {supplier.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              {supplier.phone || "Sin telefono"}
                            </p>
                            <p className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5" />
                              {supplier.email || "Sin correo"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-65 whitespace-normal text-sm text-muted-foreground">
                          <span className="inline-flex items-start gap-2">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {supplier.address || "Sin direccion registrada"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(supplier.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => void handleToggle(supplier)}
                            >
                              {supplier.isActive ? "Desactivar" : "Activar"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {!loading && filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No hay proveedores que coincidan con los filtros actuales.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
