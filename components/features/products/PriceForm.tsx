"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DollarSign } from "lucide-react";

import { ProductResponse } from "@/types/product";

interface PriceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductResponse | null;
  onPriceUpdate: (productId: number, salePrice: number) => Promise<void> | void;
}

export function PriceFormModal({
  open,
  onOpenChange,
  product,
  onPriceUpdate,
}: PriceFormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [salePrice, setSalePrice] = React.useState<number>(0);
  const [error, setError] = React.useState<string>("");
  const [showStockPrompt, setShowStockPrompt] = React.useState(false); //estado para ir a stock

  React.useEffect(() => {
    if (product) {
      setSalePrice(product.salePrice || 0);
    }
  }, [product]);

  if (!product) return null;

  function validateForm(): boolean {
    if (!product) return false;

    if (!salePrice || salePrice <= 0) {
      setError("El precio de venta debe ser mayor a cero");
      return false;
    }

    if (product.costPrice && salePrice < (product.costPrice ?? 0)) {
      setError("Advertencia: El precio de venta es menor al costo");
      // Pero permitimos continuar
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm() || !product) return;

    setIsSubmitting(true);

    try {
      await onPriceUpdate(product.id, salePrice);
      setError("");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error actualizando precio:", err);

      let message = "Error al actualizar el precio";

      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.message) message = parsed.message;
      } catch {
        message = err.message || message;
      }

      // Si el error es de stock, mostramos opción de registrar stock
      if (message.toLowerCase().includes("stock")) {
        setError(message); // mostramos el mensaje del backend
        setShowStockPrompt(true); // activamos la opción de registrar stock
      } else {
        setError(message);
        setShowStockPrompt(false);
      }
    }
  }

  const potentialProfit = salePrice - (product.costPrice ?? 0);
  const profitMargin = product.costPrice
    ? ((potentialProfit / (product.costPrice ?? 1)) * 100).toFixed(2)
    : "0";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <DialogPrimitive.Content className="relative max-w-md w-full rounded-md bg-white p-6 shadow-lg focus:outline-none">
            <DialogPrimitive.Title className="text-lg font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Asignar Precio de Venta
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mb-4 text-sm text-gray-600">
              Define el precio de venta para activar el producto
            </DialogPrimitive.Description>

            {/* Información del producto */}
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm font-semibold text-blue-900">
                {product.name}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Costo: ${product.costPrice?.toFixed(2) || "N/A"}
              </p>
              <p className="text-xs text-blue-700">
                Stock: {product.stock ?? 0} unidades
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Precio de Venta */}
              <div>
                <label htmlFor="salePrice" className="block mb-1 font-medium">
                  Precio de Venta <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    id="salePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded border border-gray-300 pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={salePrice || ""}
                    onChange={(e) => {
                      setSalePrice(parseFloat(e.target.value) || 0);
                      setError("");
                    }}
                  />
                </div>
                {error && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">{error}</p>

                    {showStockPrompt && (
                      <button
                        type="button"
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                        onClick={() => {
                          // Aquí disparas la acción de registrar stock
                          // Puede ser abrir un modal de stock-entry o redirigir
                          onOpenChange(false); // cerramos el modal de precio
                          window.location.href = `/stock-entry?productId=${product?.id}`;
                          // o si tienes un modal: setStockModalOpen(true) desde parent
                        }}
                      >
                        Registrar Stock
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Análisis de Ganancia */}
              {salePrice > 0 && product.costPrice && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">
                    Análisis de Ganancia
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ganancia por unidad:</span>
                    <span
                      className={`font-semibold ${potentialProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${potentialProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Margen de ganancia:</span>
                    <span
                      className={`font-semibold ${parseFloat(profitMargin) >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {profitMargin}%
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Precio"}
                </button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
