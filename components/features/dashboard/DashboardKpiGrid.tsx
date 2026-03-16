import { Coins, Package, ShoppingBag, TrendingUp, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary } from "@/types/dasboard";

type Props = {
  summary: DashboardSummary;
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
};

export function DashboardKpiGrid({ summary, currencyFormatter, numberFormatter }: Props) {
  const items = [
    {
      title: "Clientes activos",
      value: numberFormatter.format(summary.totalCustomers),
      hint: "Registros verificados",
      icon: Users,
    },
    {
      title: "Ventas completadas",
      value: numberFormatter.format(summary.totalSales),
      hint: "Transacciones cerradas",
      icon: ShoppingBag,
    },
    {
      title: "Ingresos totales",
      value: currencyFormatter.format(summary.totalRevenue),
      hint: "Ventas acumuladas",
      icon: TrendingUp,
    },
    {
      title: "Inversion en stock",
      value: currencyFormatter.format(summary.totalInvestment),
      hint: "Costo en inventario",
      icon: Wallet,
    },
    {
      title: "Stock disponible",
      value: numberFormatter.format(summary.totalStock),
      hint: "Unidades actuales",
      icon: Package,
    },
    {
      title: "Utilidad neta",
      value: currencyFormatter.format(summary.netProfit),
      hint: "Ganancia real",
      icon: Coins,
      isProfit: true,
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.title}
            className="group relative overflow-hidden border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/35 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1 pt-3">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.title}
              </CardTitle>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-muted/30 transition-colors group-hover:bg-muted/50">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </span>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
              <div className={`text-xl font-semibold leading-tight tracking-tight ${item.isProfit ? "text-primary" : "text-foreground"}`}>
                {item.value}
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{item.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
