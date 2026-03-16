"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Boxes, CalendarRange, PackageSearch, RefreshCcw, TrendingUp, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showToast } from "@/components/ui/modales/Toast";
import { reportService } from "@/services/report.service";
import {
  InventorySnapshotItem,
  ProfitSummary,
  SalesByCategoryItem,
  SalesByDayItem,
  SalesByProductItem,
} from "@/types/report";
import { formatDate } from "@/utils/formatDate";
import { isUnauthorizedError } from "@/utils/getAddHeaders";

type LoadResult<T> = {
  data: T | null;
  error: string | null;
  unauthorized?: boolean;
};

type SectionErrors = {
  salesByDay: string | null;
  salesByProduct: string | null;
  salesByCategory: string | null;
  inventory: string | null;
  profit: string | null;
};

const money = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function safeLoadSection<T>(loader: () => Promise<T>, fallback: string): Promise<LoadResult<T>> {
  try {
    return { data: await loader(), error: null };
  } catch (error: unknown) {
    if (isUnauthorizedError(error)) {
      return { data: null, error: null, unauthorized: true };
    }

    return { data: null, error: getErrorMessage(error, fallback) };
  }
}

function getInventoryTone(item: InventorySnapshotItem): string {
  if (item.isExhausted) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (item.isLowStock) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function renderSectionState(message: string) {
  return <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{message}</p>;
}

const KPI_CARD_TEXT = "text-slate-900";
const KPI_CARD_SUBTEXT = "text-slate-700";

export default function ReportsPage() {
  const router = useRouter();

  const [salesByDay, setSalesByDay] = React.useState<SalesByDayItem[]>([]);
  const [salesByProduct, setSalesByProduct] = React.useState<SalesByProductItem[]>([]);
  const [salesByCategory, setSalesByCategory] = React.useState<SalesByCategoryItem[]>([]);
  const [inventory, setInventory] = React.useState<InventorySnapshotItem[]>([]);
  const [profit, setProfit] = React.useState<ProfitSummary | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [sectionErrors, setSectionErrors] = React.useState<SectionErrors>({
    salesByDay: null,
    salesByProduct: null,
    salesByCategory: null,
    inventory: null,
    profit: null,
  });
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const load = React.useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [day, product, category, inventorySnapshot, profitSummary] = await Promise.all([
        safeLoadSection(
          () => reportService.getSalesByDay(startDate || undefined, endDate || undefined),
          "No se pudo cargar ventas por dia."
        ),
        safeLoadSection(
          () => reportService.getSalesByProduct(startDate || undefined, endDate || undefined),
          "No se pudo cargar ventas por producto."
        ),
        safeLoadSection(
          () => reportService.getSalesByCategory(startDate || undefined, endDate || undefined),
          "No se pudo cargar ventas por categoria."
        ),
        safeLoadSection(() => reportService.getInventory(), "No se pudo cargar el inventario actual."),
        safeLoadSection(
          () => reportService.getProfits(startDate || undefined, endDate || undefined),
          "No se pudo cargar el resumen financiero."
        ),
      ]);

      if ([day, product, category, inventorySnapshot, profitSummary].some((section) => section.unauthorized)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente para continuar.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      setSalesByDay(day.data ?? []);
      setSalesByProduct(product.data ?? []);
      setSalesByCategory(category.data ?? []);
      setInventory(inventorySnapshot.data ?? []);
      setProfit(profitSummary.data ?? null);

      const nextErrors: SectionErrors = {
        salesByDay: day.error,
        salesByProduct: product.error,
        salesByCategory: category.error,
        inventory: inventorySnapshot.error,
        profit: profitSummary.error,
      };

      setSectionErrors(nextErrors);

      const failedSections = Object.values(nextErrors).filter(Boolean);
      if (failedSections.length === 0) {
        setPageError(null);
      } else if (failedSections.length === 5) {
        setPageError("No fue posible cargar ningun bloque del centro de reportes.");
      } else {
        setPageError("Algunos bloques no pudieron cargarse. La vista muestra solo la informacion disponible.");
      }

      if (mode === "refresh" && failedSections.length > 0) {
        showToast({
          title: "Carga parcial de reportes",
          description: "Uno o mas bloques fallaron. Revisa el detalle dentro de cada tarjeta.",
          color: "warning",
        });
      }

      if (mode === "initial") {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    },
    [endDate, router, startDate]
  );

  React.useEffect(() => {
    void load();
  }, [load]);

  const topRevenueDay = React.useMemo(() => {
    return salesByDay.reduce<SalesByDayItem | null>((best, current) => {
      if (!best) {
        return current;
      }

      return current.totalAmount > best.totalAmount ? current : best;
    }, null);
  }, [salesByDay]);

  const lowStockItems = React.useMemo(() => inventory.filter((item) => item.isLowStock || item.isExhausted).length, [inventory]);

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Inteligencia comercial
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Reportes</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Revisa ventas, rentabilidad e inventario sin perder la vista operativa de lo que ya esta ocurriendo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ingresos</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{money.format(profit?.revenue ?? 0)}</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${KPI_CARD_SUBTEXT}`}>Ganancia</p>
                <p className={`mt-2 text-2xl font-semibold ${KPI_CARD_TEXT}`}>{money.format(profit?.profit ?? 0)}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${KPI_CARD_SUBTEXT}`}>Bajo stock</p>
                <p className={`mt-2 text-2xl font-semibold ${KPI_CARD_TEXT}`}>{lowStockItems}</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              Rango y actualizacion
            </CardTitle>
            <CardDescription>Filtra la ventana de analisis. Si un bloque falla, la vista mantiene el resto de datos disponibles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              <Button variant="outline" onClick={() => void load("refresh")} disabled={loading || refreshing}>
                <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refrescar
              </Button>
            </div>

            {pageError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {pageError}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-xs">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              Inversion
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{money.format(profit?.investment ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-xs">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Mejor dia
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              {topRevenueDay ? `${new Date(topRevenueDay.date).toLocaleDateString()} · ${money.format(topRevenueDay.totalAmount)}` : "Sin datos"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-xs">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Boxes className="h-3.5 w-3.5" />
              Productos monitoreados
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{inventory.length}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle>Ventas por dia</CardTitle>
              <CardDescription>Seguimiento de transacciones y monto diario en el rango seleccionado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionErrors.salesByDay ? renderSectionState(sectionErrors.salesByDay) : null}

              {!sectionErrors.salesByDay ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Transacciones</TableHead>
                      <TableHead>Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByDay.map((item) => (
                      <TableRow key={item.date}>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell>{item.transactions}</TableCell>
                        <TableCell className="font-medium text-foreground">{money.format(item.totalAmount)}</TableCell>
                      </TableRow>
                    ))}

                    {!loading && salesByDay.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                          Sin ventas registradas en el periodo seleccionado.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle>Top productos</CardTitle>
              <CardDescription>Articulos con mejor salida segun cantidad vendida.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sectionErrors.salesByProduct ? renderSectionState(sectionErrors.salesByProduct) : null}

              {!sectionErrors.salesByProduct ? (
                salesByProduct.slice(0, 8).map((item) => (
                  <div key={item.productId} className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.quantitySold} unidades vendidas</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{money.format(item.totalAmount)}</span>
                  </div>
                ))
              ) : null}

              {!loading && !sectionErrors.salesByProduct && salesByProduct.length === 0 ? (
                <p className="rounded-xl border border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">Sin productos vendidos en el periodo.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle>Ventas por categoria</CardTitle>
              <CardDescription>Distribucion del ingreso entre las categorias del catalogo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sectionErrors.salesByCategory ? renderSectionState(sectionErrors.salesByCategory) : null}

              {!sectionErrors.salesByCategory ? (
                salesByCategory.map((item) => (
                  <div key={item.categoryId} className="rounded-2xl border border-border bg-muted/20 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{item.categoryName}</p>
                        <p className="text-xs text-muted-foreground">{item.quantitySold} unidades</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{money.format(item.totalAmount)}</span>
                    </div>
                  </div>
                ))
              ) : null}

              {!loading && !sectionErrors.salesByCategory && salesByCategory.length === 0 ? (
                <p className="rounded-xl border border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">Sin categorias con ventas para este rango.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <PackageSearch className="h-4 w-4 text-muted-foreground" />
                Inventario actual
              </CardTitle>
              <CardDescription>Lectura rapida del stock disponible, minimos y agotados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionErrors.inventory ? renderSectionState(sectionErrors.inventory) : null}

              {!sectionErrors.inventory ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">Minimo {item.minimumStock}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getInventoryTone(item)}`}>
                              {item.isExhausted ? "Agotado" : item.isLowStock ? "Stock bajo" : "Estable"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!loading && inventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                          No hay inventario para mostrar en este momento.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {sectionErrors.profit ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Resumen financiero no disponible: {sectionErrors.profit}
          </div>
        ) : null}

        {!loading && salesByDay.length > 0 ? (
          <p className="text-xs text-muted-foreground">Ultima lectura consolidada: {formatDate(salesByDay[0]?.date ?? new Date().toISOString())}</p>
        ) : null}
      </div>
    </div>
  );
}
