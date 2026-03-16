"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { CalendarDays, CalendarRange, CalendarSync, Trophy, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import type { DashboardSalesAnalytics, DashboardSalesPoint } from "@/types/dasboard";

type RangeType = "day" | "month" | "year";

type Props = {
  analytics: DashboardSalesAnalytics;
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
  compact?: boolean;
};

const chartConfig = {
  totalAmount: {
    label: "Monto vendido",
    color: "var(--chart-2)",
  },
  totalTransactions: {
    label: "Transacciones",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

function getSeriesByRange(
  analytics: DashboardSalesAnalytics,
  range: RangeType
): DashboardSalesPoint[] {
  if (range === "month") return analytics.monthlySeries;
  if (range === "year") return analytics.yearlySeries;
  return analytics.dailySeries;
}

export function SalesPerformancePanel({ analytics, currencyFormatter, numberFormatter, compact = false }: Props) {
  const [range, setRange] = React.useState<RangeType>("day");

  const series = React.useMemo(() => getSeriesByRange(analytics, range), [analytics, range]);

  const peak = React.useMemo(() => {
    return series.reduce<DashboardSalesPoint | null>((best, current) => {
      if (!best) return current;
      return current.totalAmount > best.totalAmount ? current : best;
    }, null);
  }, [series]);

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm">
      <CardHeader className={compact ? "space-y-3 pb-3" : "space-y-4"}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Rendimiento de ventas</CardTitle>
            <CardDescription>Vista por dia, mes y anio para detectar picos de facturacion.</CardDescription>
          </div>

          <div className="flex items-center rounded-xl border bg-muted/35 p-1 shadow-inner">
            <Button
              size="sm"
              variant={range === "day" ? "default" : "ghost"}
              onClick={() => setRange("day")}
              className="gap-1.5 rounded-lg"
            >
              <CalendarDays className="h-4 w-4" /> Dia
            </Button>
            <Button
              size="sm"
              variant={range === "month" ? "default" : "ghost"}
              onClick={() => setRange("month")}
              className="gap-1.5 rounded-lg"
            >
              <CalendarRange className="h-4 w-4" /> Mes
            </Button>
            <Button
              size="sm"
              variant={range === "year" ? "default" : "ghost"}
              onClick={() => setRange("year")}
              className="gap-1.5 rounded-lg"
            >
              <CalendarSync className="h-4 w-4" /> Anio
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Ventas de hoy</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {currencyFormatter.format(analytics.todayRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Ventas del mes</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {currencyFormatter.format(analytics.currentMonthRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground">Ventas del anio</p>
            <p className="mt-1 text-lg font-semibold text-primary">
              {currencyFormatter.format(analytics.currentYearRevenue)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className={compact ? "space-y-3" : "space-y-4"}>
        <div className="rounded-xl border bg-muted/15 p-2">
        <ChartContainer config={chartConfig} className={compact ? "h-64 w-full" : "h-80 w-full"}>
          <BarChart
            accessibilityLayer
            data={series}
            margin={{ top: 24, right: 12, left: 12, bottom: 8 }}
          >
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-totalAmount)" stopOpacity={0.95} />
                <stop offset="100%" stopColor="var(--color-totalAmount)" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => numberFormatter.format(value)}
            />
            <ChartTooltip
              cursor={{ fill: "var(--color-muted)", fillOpacity: 0.35 }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "totalAmount") return currencyFormatter.format(Number(value));
                    return numberFormatter.format(Number(value));
                  }}
                />
              }
            />
            <Bar dataKey="totalAmount" fill="url(#salesGradient)" radius={8}>
              <LabelList
                dataKey="totalAmount"
                position="top"
                offset={8}
                formatter={(value: unknown) => numberFormatter.format(Number(value ?? 0))}
                className="fill-foreground"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        </div>

        <div className={compact ? "grid gap-2 sm:grid-cols-3" : "grid gap-3 lg:grid-cols-3"}>
          <div className="rounded-lg border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">Dia mas fuerte</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-amber-500" />
              {analytics.bestSalesWeekday}
            </p>
          </div>
          <div className="rounded-lg border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">Facturacion del mejor dia</p>
            <p className="mt-1 text-sm font-semibold">{currencyFormatter.format(analytics.bestSalesWeekdayRevenue)}</p>
          </div>
          <div className="rounded-lg border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">Transacciones del mejor dia</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              {numberFormatter.format(analytics.bestSalesWeekdayTransactions)}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Pico actual: {peak ? `${peak.label} con ${currencyFormatter.format(peak.totalAmount)}` : "Sin datos"}
        </p>
      </CardContent>
    </Card>
  );
}
