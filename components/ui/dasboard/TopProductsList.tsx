import React from "react";
import { TopSellingProductsResponse } from "@/types/dasboard";

interface TopProductsListProps {
  topProducts: TopSellingProductsResponse | null;
  loading: boolean;
  maxRevenue: number;
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
}

export function TopProductsList({
  topProducts,
  loading,
  maxRevenue,
  currencyFormatter,
  numberFormatter,
}: TopProductsListProps) {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            Top productos
          </p>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">
            Ventas con mejor rendimiento
          </h2>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          Top {topProducts?.requestedTop ?? 0}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        )}

        {!loading && topProducts?.products?.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
            No hay productos para mostrar todavia.
          </div>
        )}

        {!loading &&
          topProducts?.products?.map((product) => {
            const revenueWidth = maxRevenue
              ? Math.round((product.totalRevenue / maxRevenue) * 100)
              : 0;

            return (
              <div
                key={product.productId}
                className="rounded-xl border border-gray-200/60 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {numberFormatter.format(product.totalSold)} unidades
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {currencyFormatter.format(product.totalRevenue)}
                  </p>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400"
                    style={{ width: `${revenueWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
