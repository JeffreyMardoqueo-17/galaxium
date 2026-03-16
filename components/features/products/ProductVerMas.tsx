"use client";

import * as React from "react";
import { X, Package } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

import { ProductResponse } from "@/types/product";

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductResponse | null;
}

export function ProductDetailModal({
  open,
  onOpenChange,
  product,
}: ProductDetailModalProps) {
  if (!product) return null;

  const hasNoSalePrice = !product.salePrice || product.salePrice === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-0 gap-0 overflow-hidden sm:max-w-3xl ${hasNoSalePrice ? "ring-2 ring-red-500" : ""}`}
        showCloseButton={false}
      >
        {/* Header degradado sidebar */}
        <div className="bg-linear-to-r from-sky-600 to-cyan-600 px-6 pt-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-sky-200 text-xs mt-0.5">
                  ID: #{product.id} | SKU: {product.sku || "N/A"}
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {hasNoSalePrice && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900 mb-1">
                ⚠️ Producto sin precio de venta
              </p>
              <p className="text-xs text-red-700">
                Este producto no puede activarse hasta que se asigne un precio de venta.
              </p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-4">
            {/* Información General */}
            <div className="grid grid-cols-2 gap-4">
              {/* Categoría */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  📂 Categoría
                </h3>
                <p className="text-sm text-blue-700 font-medium">
                  {product.categoryName}
                </p>
              </div>

              {/* Estado */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  🔄 Estado
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    product.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            {/* Precios */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-3">
                💰 Precios
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-purple-600 mb-1">Costo:</p>
                  <p className="text-lg font-bold text-purple-900">
                    ${product.costPrice?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-600 mb-1">Venta:</p>
                  <p className={`text-lg font-bold ${hasNoSalePrice ? "text-red-600" : "text-purple-900"}`}>
                    {hasNoSalePrice ? "No definido" : `$${(product.salePrice ?? 0).toFixed(2)}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-600 mb-1">Ganancia:</p>
                  <p className="text-lg font-bold text-purple-900">
                    {product.salePrice && product.costPrice
                      ? `$${((product.salePrice ?? 0) - (product.costPrice ?? 0)).toFixed(2)}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="text-sm font-semibold text-green-900 mb-3">
                📊 Inventario
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-600 mb-1">Stock Actual:</p>
                  <p className="text-3xl font-bold text-green-700">
                    {product.stock ?? 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">unidades</p>
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1">Stock Mínimo:</p>
                  <p className="text-3xl font-bold text-green-700">
                    {product.minimumStock}
                  </p>
                  <p className="text-xs text-green-600 mt-1">unidades</p>
                </div>
              </div>

              {/* Alerta de stock bajo */}
              {product.stock !== null && product.stock <= product.minimumStock && (
                <div className="mt-3 rounded border border-orange-300 bg-orange-50 px-3 py-2">
                  <p className="text-xs text-orange-700 font-semibold">
                    ⚠️ Stock bajo o agotado
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 text-sm font-semibold transition-all shadow-sm shadow-sky-600/30"
            >
              Cerrar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

