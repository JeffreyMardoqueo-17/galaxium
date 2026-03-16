"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, LayoutDashboard, ShoppingCart, Sparkles, Wallet } from "lucide-react";

import {
  DashboardKpiGrid,
  DashboardRefreshButton,
  SalesPerformancePanel,
  TopProductsTable,
} from "@/components/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/services/dashboard.service";

import type {
  DashboardSalesAnalytics,
  DashboardSummary,
  TopSellingProductsResponse,
} from "@/types/dasboard";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

type DashboardData = {
  summary: DashboardSummary;
  topProducts: TopSellingProductsResponse;
  salesAnalytics: DashboardSalesAnalytics;
};

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, topProducts, salesAnalytics] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getTopSellingProducts(5),
        dashboardService.getSalesAnalytics(14, 12, 5),
      ]);
      setData({ summary, topProducts, salesAnalytics });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar el dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-full">
        <main className="mx-auto w-full max-w-420 px-3 py-4 md:px-4 lg:py-5 xl:px-5 2xl:px-6 space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-26 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <Skeleton className="h-130 rounded-xl" />
            <div className="grid gap-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-90 rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Error al cargar dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {error ?? "No se pudo cargar el dashboard."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, topProducts, salesAnalytics } = data;

  return (
    <div className="min-h-full bg-background">
      <main className="mx-auto w-full max-w-420 px-3 py-4 md:px-4 lg:py-5 xl:px-5 2xl:px-6 space-y-4">
        <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border bg-background/95 p-2.5 shadow-xs">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Dashboard ejecutivo</h1>
                <p className="text-sm text-muted-foreground">
                  Monitorea ventas, utilidad y comportamiento comercial en tiempo real.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border bg-background/75 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Operacion diaria
                  </span>
                  <span className="inline-flex items-center rounded-full border bg-background/75 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Vista General
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button asChild size="lg" className="h-10 px-5 text-sm font-semibold shadow-sm">
                <Link href="/sale">
                  <ShoppingCart className="h-4 w-4" />
                  Realizar venta
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <div className="inline-flex items-center gap-1 rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Actualizacion en vivo
              </div>
              <DashboardRefreshButton onRefresh={fetchData} />
            </div>
          </div>
        </section>

        <DashboardKpiGrid
          summary={summary}
          currencyFormatter={currencyFormatter}
          numberFormatter={numberFormatter}
        />

        <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <SalesPerformancePanel
            analytics={salesAnalytics}
            currencyFormatter={currencyFormatter}
            numberFormatter={numberFormatter}
            compact
          />

          <div className="grid gap-4">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-base">Resumen diario</CardTitle>
                <p className="text-xs text-muted-foreground">Indicadores clave de la operación actual</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/25 p-2.5">
                  <span className="text-sm text-muted-foreground">Ventas del dia</span>
                  <span className="font-semibold text-foreground">{numberFormatter.format(summary.todaySales)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/25 p-2.5">
                  <span className="text-sm text-muted-foreground">Facturacion del dia</span>
                  <span className="font-semibold text-foreground">{currencyFormatter.format(summary.todayRevenue)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/25 p-2.5">
                  <span className="text-sm text-muted-foreground">Productos agotados</span>
                  <span className="font-semibold text-foreground">{numberFormatter.format(summary.exhaustedProducts)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-primary/25 bg-primary/7 p-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Wallet className="h-4 w-4 text-primary" />
                    Utilidad neta
                  </span>
                  <span className="font-bold text-primary">{currencyFormatter.format(summary.netProfit)}</span>
                </div>
              </CardContent>
            </Card>

            <TopProductsTable
              topProducts={topProducts}
              currencyFormatter={currencyFormatter}
              numberFormatter={numberFormatter}
            />
          </div>
        </section>

        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Últimas ventas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2">Factura</th>
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Vendedor</th>
                      <th className="py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentSales.map((sale) => (
                      <tr key={sale.saleId} className="border-t">
                        <td className="py-2">{sale.invoiceNumber || "N/A"}</td>
                        <td className="py-2">{new Date(sale.saleDate).toLocaleString()}</td>
                        <td className="py-2">{sale.sellerName}</td>
                        <td className="py-2">{currencyFormatter.format(sale.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
