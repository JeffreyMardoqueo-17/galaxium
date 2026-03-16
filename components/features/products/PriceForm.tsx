"use client";

import * as React from "react";
import { DollarSign } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [showStockPrompt, setShowStockPrompt] = React.useState(false);

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

      if (message.toLowerCase().includes("stock")) {
        setError(message);
        setShowStockPrompt(true);
      } else {
        setError(message);
        setShowStockPrompt(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const potentialProfit = salePrice - (product.costPrice ?? 0);
  const profitMargin = product.costPrice
    ? ((potentialProfit / (product.costPrice ?? 1)) * 100).toFixed(2)
    : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <DollarSign className="h-5 w-5 text-green-600" />
            Asignar Precio de Venta
          </DialogTitle>
          <DialogDescription>
            Define el precio de venta para activar el producto
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm font-semibold text-blue-900">{product.name}</p>
          <p className="mt-1 text-xs text-blue-700">
            Costo: ${product.costPrice?.toFixed(2) || "N/A"}
          </p>
          <p className="text-xs text-blue-700">Stock: {product.stock ?? 0} unidades</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="salePrice" className="mb-1 block font-medium">
              Precio de Venta <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">$</span>
              <input
                id="salePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full rounded border border-input bg-background py-2 pr-3 pl-8 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="mt-2 flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => {
                      onOpenChange(false);
                      window.location.href = `/stock-entry?productId=${product?.id}`;
                    }}
                  >
                    Registrar Stock
                  </button>
                )}
              </div>
            )}
          </div>

          {salePrice > 0 && product.costPrice && (
            <div className="space-y-2 rounded-lg border border-border bg-muted p-3">
              <p className="text-xs font-semibold text-muted-foreground">Análisis de Ganancia</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ganancia por unidad:</span>
                <span className={`font-semibold ${potentialProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${potentialProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Margen de ganancia:</span>
                <span className={`font-semibold ${parseFloat(profitMargin) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {profitMargin}%
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded border border-border px-4 py-2 hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Precio"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
