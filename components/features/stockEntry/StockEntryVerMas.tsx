"use client";

import * as React from "react";
import { X, PackagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-2xl" showCloseButton={false}>
        {/* Header degradado sidebar */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 px-6 pt-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">
                  Detalles de Entrada de Stock
                </DialogTitle>
                <DialogDescription className="text-emerald-200 text-xs mt-0.5">
                  ID: #{stockEntry.id}
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
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
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

