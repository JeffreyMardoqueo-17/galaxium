import React from "react";
import { DashboardSummary } from "@/types/dasboard";

interface ExecutiveSummaryProps {
  summary: DashboardSummary | null;
  loading: boolean;
  currencyFormatter: Intl.NumberFormat;
}

export function ExecutiveSummary({
  summary,
  loading,
  currencyFormatter,
}: ExecutiveSummaryProps) {
  if (loading) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border  border-gray-200/70 bg-white/70" />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/70 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6 text-white shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-300">
        Resumen ejecutivo
      </p>
      <h3 className="mt-3 text-2xl font-semibold">
        Rentabilidad del periodo
      </h3>
      <p className="mt-2 text-sm text-gray-300">
        Comparativo entre inversion en stock e ingresos reales.
      </p>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Ingresos
          </p>
          <p className="mt-1 text-xl font-semibold">
            {currencyFormatter.format(summary?.totalRevenue ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Inversion
          </p>
          <p className="mt-1 text-xl font-semibold">
            {currencyFormatter.format(summary?.totalInvestment ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
            Utilidad neta
          </p>
          <p className="mt-1 text-xl font-semibold text-emerald-100">
            {currencyFormatter.format(summary?.netProfit ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
