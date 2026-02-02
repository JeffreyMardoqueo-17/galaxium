"use client";

import { Eye, Pencil, Trash2, Package, Tag, Layers } from "lucide-react";

import { ProductCardModel } from "@/types/product-card"
import { IoIosCreate, IoIosColorFilter } from "react-icons/io";
import { MdCleaningServices } from "react-icons/md";

interface ProductCardProps {
  product: ProductCardModel
  onView?: (product: ProductCardModel) => void
  onEdit?: (product: ProductCardModel) => void
  onDelete?: (product: ProductCardModel) => void
}


export function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const isLowStock = product.stock <= product.minimumStock;

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight">
            {product.name}
          </h3>

          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0
              ${
                product.isActive
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
          >
            {product.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-1 font-mono">
          {product.sku}
        </p>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-4 space-y-4">
        {/* STOCK + CATEGORY */}
        <div className="grid grid-cols-2 gap-4">
          {/* STOCK */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg
                ${
                  isLowStock
                    ? "bg-amber-100 text-amber-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
            >
              <Package className="w-4 h-4" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Stock</p>
              <p
                className={`text-sm font-semibold ${
                  isLowStock ? "text-amber-600" : "text-gray-900"
                }`}
              >
                {product.stock}
                {isLowStock && (
                  <span className="text-xs ml-1">
                    (mín {product.minimumStock})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <Layers className="w-4 h-4" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Categoría</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.categoryName}
              </p>
            </div>
          </div>
        </div>

        {/* PRICE */}
        <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
          <Tag className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Precio de venta</p>
            <p className="text-xl font-bold text-blue-600">
              ${product.salePrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex gap-2">
          <button
            onClick={() => onView?.(product)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-100 transition"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>

          <button
            onClick={() => onEdit?.(product)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 transition"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>

          <button
            onClick={() => onDelete?.(product)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
