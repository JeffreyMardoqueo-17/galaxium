"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <DialogPrimitive.Content
            className={`relative max-w-3xl w-full rounded-md bg-white p-6 shadow-lg focus:outline-none ${
              hasNoSalePrice ? "border-4 border-red-500" : ""
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <DialogPrimitive.Title className="text-xl font-semibold">
                  {product.name}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-sm text-gray-600 mt-1">
                  ID: #{product.id} | SKU: {product.sku || "N/A"}
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close asChild>
                <button
                  className="rounded-full p-1 hover:bg-gray-100 transition"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogPrimitive.Close>
            </div>

            {/* Advertencia sin precio */}
            {hasNoSalePrice && (
              <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900 mb-1">
                  ⚠️ Producto sin precio de venta
                </p>
                <p className="text-xs text-red-700">
                  Este producto no puede activarse hasta que se asigne un precio de venta.
                </p>
              </div>
            )}

            {/* Content */}
            <div className="space-y-6">
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
            <div className="flex justify-end mt-6 pt-4 border-t gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Cerrar
              </button>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
