import { TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary } from "@/types/dasboard";

type Props = {
  summary: DashboardSummary;
  currencyFormatter: Intl.NumberFormat;
};

export function ProfitSummaryCard({ summary, currencyFormatter }: Props) {
  const marginPercent = summary.totalRevenue > 0
    ? (summary.netProfit / summary.totalRevenue) * 100
    : 0;

  const investmentRatio = summary.totalRevenue > 0
    ? (summary.totalInvestment / summary.totalRevenue) * 100
    : 0;

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Resumen ejecutivo</CardTitle>
        <p className="text-xs text-muted-foreground">Composicion financiera actual</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/25 p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" /> Ingresos
          </div>
          <span className="font-semibold text-foreground">{currencyFormatter.format(summary.totalRevenue)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/25 p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" /> Inversion
          </div>
          <span className="font-semibold text-foreground">{currencyFormatter.format(summary.totalInvestment)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-primary/25 bg-primary/7 p-3">
          <span className="text-sm font-medium">Utilidad neta</span>
          <span className="font-bold text-primary">
            {currencyFormatter.format(summary.netProfit)}
          </span>
        </div>

        <div className="space-y-3 rounded-xl border bg-muted/25 p-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Margen neto</span>
              <span>{Math.max(0, marginPercent).toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, marginPercent))}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Peso de inversion</span>
              <span>{Math.max(0, investmentRatio).toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-muted-foreground"
                style={{ width: `${Math.min(100, Math.max(0, investmentRatio))}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
