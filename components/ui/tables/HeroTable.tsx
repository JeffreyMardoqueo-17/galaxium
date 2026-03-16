"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <Card className="space-y-4">
      {/* ================= MOBILE (CARDS) ================= */}
      <div className="space-y-4 md:hidden p-4">
        {paginatedData.length === 0 && (
          <p className="text-center text-muted-foreground">
            No hay datos para mostrar
          </p>
        )}

        {paginatedData.map((item) => (
          <Card
            key={item.id}
            className="border border-border/70 bg-card p-4"
          >
            {columns.map(({ key, label, render }) => (
              <div key={String(key)} className="flex justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {label}
                </span>
                <span className="text-sm text-right text-gray-900">
                  {render ? render(item) : String(item[key])}
                </span>
              </div>
            ))}

            {actions && (
              <div className="pt-3 flex justify-end gap-2">
                {actions(item)}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* ================= DESKTOP (TABLE) ================= */}
      <CardContent className="hidden md:block overflow-x-auto px-0">
        <Table className="min-w-full select-none">
          <TableHeader>
            <TableRow>
              {columns.map(({ key, label, align }) => (
                <TableHead
                  key={String(key)}
                  className={`p-4 text-xs font-semibold uppercase tracking-wide text-gray-800 ${
                    align === "end"
                      ? "text-right"
                      : align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {label}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="p-4 text-xs font-semibold uppercase tracking-wide text-center text-gray-800">
                  Acciones
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center p-10 text-muted-foreground"
                >
                  No hay datos para mostrar
                </TableCell>
              </TableRow>
            )}

            {paginatedData.map((item) => (
              <TableRow
                key={item.id}
                className="last:border-b-0"
              >
                {columns.map(({ key, render, align }) => (
                  <TableCell
                    key={String(key)}
                    className={`p-4 text-sm text-shadow-gray-600 ${
                      align === "end"
                        ? "text-right"
                        : align === "center"
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    {render ? render(item) : String(item[key])}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="p-4 text-center">{actions(item)}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* ================= PAGINATION ================= */}
      <div className="flex items-center justify-between px-4 pb-4">
        <span className="text-sm text-muted-foreground">
          Página <strong>{page}</strong> de <strong>{totalPages}</strong>
        </span>

        <div className="flex gap-2">
          <Button
            disabled={!canGoPrev}
            onClick={() => onPageChange(page - 1)}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>

          <Button
            disabled={!canGoNext}
            onClick={() => onPageChange(page + 1)}
            variant="outline"
            size="sm"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </Card>
  );
}
