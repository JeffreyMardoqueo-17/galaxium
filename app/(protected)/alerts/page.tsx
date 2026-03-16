"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BellRing, PackageSearch, RefreshCcw, Search, Siren } from "lucide-react";

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
import { showToast } from "@/components/ui/modales/Toast";
import { reportService } from "@/services/report.service";
import { StockAlert } from "@/types/report";
import { formatDate } from "@/utils/formatDate";
import { isUnauthorizedError } from "@/utils/getAddHeaders";

type ComboboxOption = { id: string; label: string };

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getAlertLabel(type: string): string {
  switch (type.toLowerCase()) {
    case "lowstock":
      return "Stock bajo";
    case "outofstock":
      return "Agotado";
    case "nomovement":
      return "Sin movimiento";
    default:
      return type;
  }
}

function getAlertTone(type: string): string {
  switch (type.toLowerCase()) {
    case "outofstock":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "lowstock":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "nomovement":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export default function AlertsPage() {
  const router = useRouter();

  const [alerts, setAlerts] = React.useState<StockAlert[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [selectedTypeId, setSelectedTypeId] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setAlerts(await reportService.getAlerts());
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

      setError(getErrorMessage(error, "No se pudieron cargar las alertas de inventario"));
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);

    try {
      const refreshed = await reportService.refreshAlerts();
      setAlerts(refreshed);
      showToast({
        title: "Alertas actualizadas",
        description: "El motor de alertas se refresco correctamente.",
        color: "success",
      });
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
        title: "No se pudieron refrescar las alertas",
        description: getErrorMessage(error, "Operacion rechazada por el servidor."),
        color: "danger",
      });
    } finally {
      setRefreshing(false);
    }
  }

  const alertOptions = React.useMemo<ComboboxOption[]>(() => {
    const types = Array.from(new Set(alerts.map((alert) => alert.alertType)));
    return [{ id: "", label: "Todos los tipos" }, ...types.map((type) => ({ id: type, label: getAlertLabel(type) }))];
  }, [alerts]);

  const selectedType = React.useMemo(() => {
    return alertOptions.find((option) => option.id === selectedTypeId) ?? alertOptions[0] ?? null;
  }, [alertOptions, selectedTypeId]);

  const filteredAlerts = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesType = selectedTypeId ? alert.alertType === selectedTypeId : true;
      const matchesSearch =
        !term ||
        [alert.product?.name ?? "", alert.message, alert.alertType]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesType && matchesSearch;
    });
  }, [alerts, search, selectedTypeId]);

  const lowStockCount = React.useMemo(
    () => alerts.filter((alert) => alert.alertType.toLowerCase() === "lowstock").length,
    [alerts]
  );
  const exhaustedCount = React.useMemo(
    () => alerts.filter((alert) => alert.alertType.toLowerCase() === "outofstock").length,
    [alerts]
  );

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <BellRing className="h-3.5 w-3.5" />
                Monitoreo preventivo
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Alertas de inventario</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Supervisa productos agotados, bajo minimos o sin movimiento antes de que afecten ventas y compras.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Activas</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{alerts.length}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Stock bajo</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{lowStockCount}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Agotados</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{exhaustedCount}</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Siren className="h-4 w-4 text-muted-foreground" />
              Consola de alertas
            </CardTitle>
            <CardDescription>Filtra por tipo, busca por producto y relanza el escaneo cuando lo necesites.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_240px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar por producto o mensaje"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <Combobox
                items={alertOptions}
                value={selectedType}
                onValueChange={(option: ComboboxOption | null) => setSelectedTypeId(option?.id ?? "")}
                itemToStringLabel={(option) => option?.label ?? ""}
                itemToStringValue={(option) => option?.id ?? ""}
              >
                <ComboboxInput placeholder="Tipo de alerta" showClear />
                <ComboboxContent className="z-50">
                  <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                  <ComboboxList>
                    {(option: ComboboxOption) => (
                      <ComboboxItem key={option.id || "all-alerts"} value={option}>
                        {option.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <Button variant="outline" onClick={() => void handleRefresh()} disabled={refreshing || loading}>
                <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refrescar
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getAlertTone(alert.alertType)}`}>
                        {getAlertLabel(alert.alertType)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PackageSearch className="h-4 w-4 text-muted-foreground" />
                        <span>{alert.product?.name ?? `#${alert.productId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-105 whitespace-normal text-sm text-muted-foreground">{alert.message}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(alert.createdAt)}</TableCell>
                  </TableRow>
                ))}

                {!loading && filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Sin alertas activas para los filtros actuales.
                      </span>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
