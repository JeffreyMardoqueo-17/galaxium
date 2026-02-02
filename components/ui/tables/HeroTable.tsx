"use client";

import React, { useMemo } from "react";

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

  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function HeroTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
  page,
  pageSize,
  totalItems,
  onPageChange,
}: HeroTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  // 🔥 Paginación frontend
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, page, pageSize]);

  return (
    <div className="rounded-xl shadow-sm bg-(--color-page) space-y-4">
      {/* ================= MOBILE (CARDS) ================= */}
      <div className="space-y-4 md:hidden p-4">
        {paginatedData.length === 0 && (
          <p className="text-center text-muted-foreground">
            No hay datos para mostrar
          </p>
        )}

        {paginatedData.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 space-y-2 bg-background shadow-sm"
          >
            {columns.map(({ key, label, render }) => (
              <div key={String(key)} className="flex justify-between gap-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  {label}
                </span>
                <span className="text-sm text-right">
                  {render ? render(item) : String(item[key])}
                </span>
              </div>
            ))}

            {actions && (
              <div className="pt-2 flex justify-end gap-2">
                {actions(item)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ================= DESKTOP (TABLE) ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-150table-auto border-collapse">
          <thead>
            <tr className="border-b bg-muted/50 bg-gray-100 ">
              {columns.map(({ key, label, align }) => (
                <th
                  key={String(key)}
                  className={`p-4 text-sm font-medium ${
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
                <th className="p-4 text-sm font-medium text-center">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center p-8 text-muted-foreground"
                >
                  No hay datos para mostrar
                </td>
              </tr>
            )}

            {paginatedData.map((item) => (
              <tr
                key={item.id}
                className=" last:border-b-0 hover:bg-muted/20 transition"
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

      {/* ================= PAGINATION ================= */}
      <div className="flex items-center justify-between px-4 pb-4">
        <span className="text-sm text-muted-foreground">
          Página <strong>{page}</strong> de <strong>{totalPages}</strong>
        </span>

        <div className="flex gap-2">
          <button
            disabled={!canGoPrev}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >
            Anterior
          </button>

          <button
            disabled={!canGoNext}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
