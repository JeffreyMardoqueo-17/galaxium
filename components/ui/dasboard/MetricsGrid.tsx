import React from "react";
import {
  Coins,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { DashboardSummary } from "@/types/dasboard";

interface MetricsGridProps {
  summary: DashboardSummary | null;
  loading: boolean;
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
}

export function MetricsGrid({
  summary,
  loading,
  currencyFormatter,
  numberFormatter,
}: MetricsGridProps) {
  const metrics = [
    {
      title: "Clientes activos",
      value: numberFormatter.format(summary?.totalCustomers ?? 0),
      icon: <Users className="h-5 w-5" />,
      tone: "bg-sky-100 text-sky-700",
      caption: "Registros verificados",
    },
    {
      title: "Ventas completadas",
      value: numberFormatter.format(summary?.totalSales ?? 0),
      icon: <ShoppingBag className="h-5 w-5" />,
      tone: "bg-emerald-100 text-emerald-700",
      caption: "Transacciones cerradas",
    },
    {
      title: "Ingresos totales",
      value: currencyFormatter.format(summary?.totalRevenue ?? 0),
      icon: <TrendingUp className="h-5 w-5" />,
      tone: "bg-sky-100 text-sky-700",
      caption: "Ventas acumuladas",
    },
    {
      title: "Inversion en stock",
      value: currencyFormatter.format(summary?.totalInvestment ?? 0),
      icon: <Wallet className="h-5 w-5" />,
      tone: "bg-amber-100 text-amber-700",
      caption: "Costo en inventario",
    },
    {
      title: "Stock disponible",
      value: numberFormatter.format(summary?.totalStock ?? 0),
      icon: <Package className="h-5 w-5" />,
      tone: "bg-orange-100 text-orange-700",
      caption: "Unidades actuales",
    },
    {
      title: "Utilidad neta",
      value: currencyFormatter.format(summary?.netProfit ?? 0),
      icon: <Coins className="h-5 w-5" />,
      tone: "bg-rose-100 text-rose-700",
      caption: "Ganancia real",
    },
  ];

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          tone={metric.tone}
          caption={metric.caption}
          loading={loading}
        />
      ))}
    </section>
  );
}

