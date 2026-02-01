"use client";

import React, { useEffect, useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: "start" | "center" | "end";
};

type HeroTableProps<T extends { id: string | number }> = {
  columns: Column<T>[];
  data: T[];
  actions?: (item: T) => React.ReactNode;
};

export function HeroTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
}: HeroTableProps<T>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evita mismatch de hidratación en Next.js
  if (!mounted) return null;

  return (
    <div className="rounded-xl shadow-sm bg-[var(--color-page)] overflow-x-auto">
      <table className="w-full min-w-[600px] table-auto border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map(({ key, label, align }) => (
              <th
                key={String(key)}
                className={`p-4 text-sm font-medium text-left ${
                  align === "end"
                    ? "text-right"
                    : align === "center"
                    ? "text-center"
                    : "text-left"
                }`}
              >
                {label}
              </th>
            ))}
            {actions && (
              <th className="p-4 text-sm font-medium text-center">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center p-8 text-muted-foreground"
              >
                No hay datos para mostrar
              </td>
            </tr>
          )}
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b last:border-b-0 hover:bg-muted/20 transition"
            >
              {columns.map(({ key, render, align }) => (
                <td
                  key={String(key)}
                  className={`p-4 text-sm ${
                    align === "end"
                      ? "text-right"
                      : align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {render ? render(item) : String(item[key])}
                </td>
              ))}
              {actions && (
                <td className="p-4 text-center">{actions(item)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
