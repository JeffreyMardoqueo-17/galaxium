"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, value]) => value.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: colorConfig
          .map(
            ([key, value]) =>
              `[data-chart=${id}] { --color-${key}: ${value.color}; }`
          )
          .join("\n"),
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartTooltipItem = {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
  fill?: string;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: React.ReactNode;
  className?: string;
  formatter?: (value: number | string, name: string) => React.ReactNode;
  hideLabel?: boolean;
};

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  formatter,
  hideLabel = false,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={cn("rounded-lg border bg-background px-3 py-2 text-xs shadow-md", className)}>
      {!hideLabel ? <p className="mb-1 font-medium">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((item: ChartTooltipItem, index: number) => {
          const key = `${item.dataKey ?? "value"}`;
          const itemConfig = config[key];
          const color = item.color || item.fill || "var(--color-muted-foreground)";
          const value = item.value ?? 0;
          const name = `${item.name ?? key}`;

          return (
            <div key={`${key}-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
                <span>{itemConfig?.label ?? item.name ?? key}</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatter ? formatter(value, name) : `${value}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
};
