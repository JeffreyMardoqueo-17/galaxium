"use client";

import React from "react";
import { dashboardService } from "@/services/dashboard.service";
import {
  DashboardSummary,
  TopSellingProductsResponse,
} from "@/types/dasboard";
import {
  DashboardHeader,
  MetricsGrid,
  TopProductsList,
  ExecutiveSummary,
} from "@/components/ui/dasboard";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [topProducts, setTopProducts] =
    React.useState<TopSellingProductsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, topProductsData] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getTopSellingProducts(5),
        ]);
        setSummary(summaryData);
        setTopProducts(topProductsData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error inesperado";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const maxRevenue = React.useMemo(() => {
    if (!topProducts?.products?.length) return 0;
    return Math.max(...topProducts.products.map((p) => p.totalRevenue));
  }, [topProducts]);

  return (
    <div className="min-h-auto bg-[radial-gradient(circle_at_top,_#f7f2ff,_#f6fafc_35%,_#f7f7fb_100%)]">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <MetricsGrid
          summary={summary}
          loading={loading}
          currencyFormatter={currencyFormatter}
          numberFormatter={numberFormatter}
        />

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <TopProductsList
            topProducts={topProducts}
            loading={loading}
            maxRevenue={maxRevenue}
            currencyFormatter={currencyFormatter}
            numberFormatter={numberFormatter}
          />

          <ExecutiveSummary
            summary={summary}
            loading={loading}
            currencyFormatter={currencyFormatter}
          />
        </section>
      </main>
    </div>
  );
}
