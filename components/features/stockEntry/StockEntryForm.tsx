"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { StockEntryCreate } from "@/types/StockEntry";
import { ProductResponse } from "@/types/product";
import { getProductsByFilter } from "@/services/product.service";

interface StockEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStockEntryCreate: (data: StockEntryCreate) => Promise<void>;
}

export function StockEntryForm({
  open,
  onOpenChange,
  onStockEntryCreate,
}: StockEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<StockEntryCreate>({
    productId: 0,
    quantity: 0,
    unitCost: 0,
  });

  // 🔍 UI-only state
  const [productSearch, setProductSearch] = React.useState("");
  const [products, setProducts] = React.useState<ProductResponse[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof StockEntryCreate, string>>
  >({});

  const [apiError, setApiError] = React.useState<string | null>(null);

  /* ===========================
     BUSCAR PRODUCTOS (debounced)
     =========================== */
  React.useEffect(() => {
    if (!productSearch.trim()) {
      setProducts([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const data = await getProductsByFilter({
          name: productSearch,
          isActive: true,
          pageSize: 5,
        });
        setProducts(data);
        setShowDropdown(true);
      } catch {
        setProducts([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [productSearch]);

  /* ===========================
     VALIDACIÓN
     =========================== */
  function validateForm(): boolean {
    const newErrors: Partial<Record<keyof StockEntryCreate, string>> = {};

    if (formData.productId <= 0) {
      newErrors.productId = "Debe seleccionar un producto de la lista";
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = "La cantidad debe ser mayor a cero";
    }

    if (formData.unitCost <= 0) {
      newErrors.unitCost = "El costo unitario debe ser mayor a cero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ===========================
     SUBMIT
     =========================== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onStockEntryCreate(formData);

      setFormData({ productId: 0, quantity: 0, unitCost: 0 });
      setProductSearch("");
      setProducts([]);
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Error al crear la entrada de stock"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ===========================
     SELECT PRODUCT
     =========================== */
  function selectProduct(product: ProductResponse) {
    setProductSearch(product.name);
    setFormData((prev) => ({ ...prev, productId: product.id }));
    setShowDropdown(false);
    setProducts([]);
  }

  /* ===========================
     UI
     =========================== */
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPrimitive.Content className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <DialogPrimitive.Title className="text-lg font-semibold mb-2">
              Registrar Entrada de Stock
            </DialogPrimitive.Title>

            {apiError && (
              <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PRODUCT SEARCH */}
              <div className="relative">
                <label className="block mb-1 font-medium">
                  Producto <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-green-500"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setFormData((p) => ({ ...p, productId: 0 }));
                  }}
                />

                {showDropdown && products.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-40 overflow-auto">
                    {products.map((p) => (
                      <li
                        key={p.id}
                        className="px-3 py-2 hover:bg-green-100 cursor-pointer"
                        onClick={() => selectProduct(p)}
                      >
                        {p.name}
                      </li>
                    ))}
                  </ul>
                )}

                {errors.productId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.productId}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block mb-1 font-medium">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded border px-3 py-2"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      quantity: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {/* Unit Cost */}
              <div>
                <label className="block mb-1 font-medium">Costo Unitario</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded border px-3 py-2"
                  value={formData.unitCost || ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      unitCost: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
