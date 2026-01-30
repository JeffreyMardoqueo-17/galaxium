"use client";

import React from "react";
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
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <Table
        aria-label="ERP Table"
        className="w-full"
        removeWrapper
        classNames={{
          th: "bg-(--color-table-header-bg) text-white text-sm font-semibold",
          thead: "border-b border-black/10",
        }}
      >
        {/* HEADER */}
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={String(column.key)}
              className="text-sm font-semibold text-gray-600 text-left px-4 py-3"
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>

        {/* BODY */}
        <TableBody items={data} emptyContent="Sin datos">
          {(item) => (
            <TableRow key={item.id} className="hover:bg-gray-50 transition">
              {(columnKey) => {
                const column = columns.find(
                  (c) => String(c.key) === String(columnKey),
                );

                if (!column) {
                  return (
                    <TableCell className="px-4 py-3 text-gray-400">—</TableCell>
                  );
                }

                return (
                  <TableCell
                    className={`px-4 py-3 text-sm text-gray-700 text-${
                      column.align ?? "left"
                    }`}
                  >
                    {column.render
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
