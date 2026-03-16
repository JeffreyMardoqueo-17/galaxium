"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, LayoutDashboard, ShoppingCart, Sparkles } from "lucide-react";

import {
  DashboardKpiGrid,
  DashboardRefreshButton,
  ProfitSummaryCard,
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
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8 space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[420px] w-full rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
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
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8 space-y-6">
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
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
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border bg-background/75 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Operacion diaria
                  </span>
                  <span className="inline-flex items-center rounded-full border bg-background/75 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Vista gerencial
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button asChild size="lg" className="h-11 px-6 text-base font-semibold shadow-sm">
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

        <SalesPerformancePanel
          analytics={salesAnalytics}
          currencyFormatter={currencyFormatter}
          numberFormatter={numberFormatter}
        />

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <TopProductsTable
            topProducts={topProducts}
            currencyFormatter={currencyFormatter}
            numberFormatter={numberFormatter}
          />
          <ProfitSummaryCard
            summary={summary}
            currencyFormatter={currencyFormatter}
          />
        </section>
      </main>
    </div>
  );
}
