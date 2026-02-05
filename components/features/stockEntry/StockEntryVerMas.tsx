"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { StockEntryResponse } from "@/types/StockEntry";
import { formatDate } from "@/utils/formatDate";

interface StockEntryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockEntry: StockEntryResponse | null;
}

// Helper para mostrar tipos en español
function getReferenceTypeLabel(type: string): string {
  switch (type) {
    case "Purchase":
      return "Compra";
    case "Sale":
      return "Venta";
    case "Adjustment":
      return "Ajuste";
    default:
      return type || "Desconocido";
  }
}

// Helper para colores de badge
function getReferenceTypeColor(type: string): string {
  switch (type) {
    case "Purchase":
      return "bg-green-100 text-green-700";
    case "Sale":
      return "bg-red-100 text-red-700";
    case "Adjustment":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function StockEntryDetailModal({
  open,
  onOpenChange,
  stockEntry,
}: StockEntryDetailModalProps) {
  if (!stockEntry) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <DialogPrimitive.Content
            className="relative max-w-2xl w-full rounded-md bg-white p-6 shadow-lg focus:outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <DialogPrimitive.Title className="text-xl font-semibold">
                  Detalles de Entrada de Stock
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-sm text-gray-600 mt-1">
                  ID: #{stockEntry.id}
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

            {/* Content */}
            <div className="space-y-6">
              {/* Información del Producto */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">
                  📦 Producto
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 font-medium">Nombre:</span>
                    <span className="text-sm text-blue-900 font-semibold">
                      {stockEntry.productName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 font-medium">ID Producto:</span>
                    <span className="text-sm text-blue-900">#{stockEntry.productId}</span>
                  </div>
                </div>
              </div>

              {/* Información de Cantidad y Costos */}
              <div className="grid grid-cols-2 gap-4">
                {/* Cantidad */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">
                    📊 Cantidad
                  </h3>
                  <p className="text-3xl font-bold text-green-700">
                    +{stockEntry.quantity}
                  </p>
                  <p className="text-xs text-green-600 mt-1">unidades</p>
                </div>

                {/* Costo Unitario */}
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">
                    💵 Costo Unitario
                  </h3>
                  <p className="text-3xl font-bold text-purple-700">
                    ${stockEntry.unitCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">por unidad</p>
                </div>
              </div>

              {/* Costo Total */}
              <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-700">
                    💰 Costo Total
                  </h3>
                  <p className="text-4xl font-bold text-gray-900">
                    ${stockEntry.totalCost.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Tipo de Movimiento y Referencia */}
              <div className="grid grid-cols-2 gap-4">
                {/* Tipo de Movimiento */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    🔄 Tipo de Movimiento
                  </h3>
                  <span
                    className={`inline-block px-3 py-2 rounded-full text-sm font-semibold ${getReferenceTypeColor(
                      stockEntry.referenceType
                    )}`}
                  >
                    {getReferenceTypeLabel(stockEntry.referenceType)}
                  </span>
                </div>

                {/* Referencia */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    🔗 Referencia
                  </h3>
                  {stockEntry.referenceId ? (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">ID:</p>
                      <p className="text-lg font-semibold text-gray-900">
                        #{stockEntry.referenceId}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Sin referencia</p>
                  )}
                </div>
              </div>

              {/* Información del Usuario y Fecha */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  👤 Información de Registro
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Registrado por:</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {stockEntry.userName}
                    </p>
                    <p className="text-xs text-gray-400">ID: {stockEntry.userId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fecha y hora:</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(stockEntry.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6 pt-4 border-t">
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
