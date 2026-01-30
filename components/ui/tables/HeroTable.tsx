"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/react";

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

  // 🚨 CLAVE: evita hydration mismatch
  if (!mounted) return null;

  return (
    <div className="rounded-xl shadow-sm bg-(--color-page)">
      <Table
        aria-label="ERP Table"
        removeWrapper
        className="w-full"
        classNames={{
          th: `
            bg-(--color-table-header-bg)
            text-(--color-table-header-text)
            text-sm font-semibold
          `,
          thead: "border-b border-black/10 dark:border-white/10",
          td: "text-sm",
        }}
      >
        {/* HEADER */}
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={String(column.key)}
              className="px-4 py-3 text-left"
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>

        {/* BODY */}
        <TableBody items={data} emptyContent="Sin datos">
          {(item) => (
            <TableRow
              key={item.id}
              className="
                hover:bg-black/5
                dark:hover:bg-white/5
                transition
              "
            >
              {(columnKey) => {
                const column = columns.find(
                  (c) => String(c.key) === String(columnKey),
                );

                return (
                  <TableCell
                    className={`px-4 py-3 text-${
                      column?.align ?? "start"
                    }`}
                  >
                    {column?.render
                      ? column.render(item)
                      : String(getKeyValue(item, columnKey))}
                  </TableCell>
                );
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
