import React from "react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
  caption: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  icon,
  tone,
  caption,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-2xl border border-gray-200/70 bg-white/70" />
    );
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200/70 bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
          {title}
        </p>
        <div className={`rounded-full px-3 py-2 ${tone}`}>{icon}</div>
      </div>
      <div className="mt-5">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{caption}</p>
      </div>
    </div>
  );
}
