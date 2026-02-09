"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Plus } from "lucide-react";

import { StockEntryCreate, StockReferenceType } from "@/types/StockEntry";
import { ProductResponse } from "@/types/product";

interface CreateStockEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductResponse[];
  onStockEntryCreate: (data: StockEntryCreate) => Promise<void> | void;
}

export function CreateStockEntryModal({
  open,
  onOpenChange,
  products,
  onStockEntryCreate,
}: CreateStockEntryModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<StockEntryCreate>({
    productId: 0,
    quantity: 0,
    unitCost: 0,
    referenceType: StockReferenceType.Purchase,
    referenceId: undefined,
  });

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof StockEntryCreate, string>>
  >({});

  // Obtener producto seleccionado para mostrar info y advertencias
  const selectedProduct = React.useMemo(
    () => products.find((p) => p.id === formData.productId),
    [products, formData.productId]
  );

  // Calcular costo total
  const totalCost = React.useMemo(
    () => formData.quantity * formData.unitCost,
    [formData.quantity, formData.unitCost]
  );

  function validateForm() {
    const newErrors: Partial<Record<keyof StockEntryCreate, string>> = {};

    if (!formData.productId || formData.productId === 0)
      newErrors.productId = "El producto es requerido";

    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "La cantidad debe ser mayor a cero";

    if (!formData.unitCost || formData.unitCost <= 0)
      newErrors.unitCost = "El costo unitario debe ser mayor a cero";

    if (!formData.referenceType)
      newErrors.referenceType = "El tipo de movimiento es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onStockEntryCreate(formData);

      // ✅ Solo si llega aquí (sin error), limpiamos y cerramos
      setFormData({
        productId: 0,
        quantity: 0,
        unitCost: 0,
        referenceType: StockReferenceType.Purchase,
        referenceId: undefined,
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      // ❌ El error ya fue manejado en la página con showToast
      // NO cerramos el modal para que el usuario pueda corregir
      console.error("Error creando entrada de stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(
    field: keyof StockEntryCreate,
    value: string | number | StockReferenceType
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          <Plus className="mr-2 w-4 h-4" /> Nueva Entrada de Stock
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <DialogPrimitive.Content
            className="relative max-w-lg w-full rounded-md bg-white p-6 shadow-lg focus:outline-none"
          >
            <DialogPrimitive.Title className="text-lg font-semibold mb-2">
              Registrar Entrada de Stock
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mb-4 text-sm text-gray-600">
              Registra una nueva entrada de inventario para actualizar el stock y el costo del producto.
            </DialogPrimitive.Description>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Producto */}
              <div>
                <label className="block mb-1 font-medium" htmlFor="product">
                  Producto <span className="text-red-600">*</span>
                </label>
                <SelectPrimitive.Root
                  value={formData.productId ? formData.productId.toString() : ""}
                  onValueChange={(val) => handleInputChange("productId", Number(val))}
                >
                  <SelectPrimitive.Trigger
                    id="product"
                    className="inline-flex items-center justify-between w-full rounded border border-gray-300 px-3 py-2 text-left text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Selecciona un producto"
                  >
                    <SelectPrimitive.Value placeholder="Selecciona un producto" />
                    <SelectPrimitive.Icon>
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        className="ml-2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </SelectPrimitive.Icon>
                  </SelectPrimitive.Trigger>

                  <SelectPrimitive.Content
                    sideOffset={5}
                    className="overflow-hidden rounded-md border border-gray-300 bg-white shadow-md z-50"
                  >
                    <SelectPrimitive.ScrollUpButton />
                    <SelectPrimitive.Viewport className="max-h-60">
                      {products.map((prod) => (
                        <SelectPrimitive.Item
                          key={prod.id}
                          value={prod.id.toString()}
                          className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-gray-700 data-[highlighted]:bg-green-600 data-[highlighted]:text-white"
                        >
                          <SelectPrimitive.ItemText>
                            {prod.name} {prod.sku && `(${prod.sku})`}
                          </SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectPrimitive.Viewport>
                    <SelectPrimitive.ScrollDownButton />
                  </SelectPrimitive.Content>
                </SelectPrimitive.Root>
                {errors.productId && (
                  <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
                )}

                {/* Advertencia si el producto no tiene precio de venta */}
                {selectedProduct && !selectedProduct.salePrice && (
                  <div className="mt-2 rounded border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                    ⚠️ <strong>Advertencia:</strong> El producto "{selectedProduct.name}" no tiene precio de venta. 
                    Deberás asignar uno después para poder activarlo.
                  </div>
                )}

                {/* Info del producto seleccionado */}
                {selectedProduct && (
                  <div className="mt-2 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                    <p><strong>Stock actual:</strong> {selectedProduct.stock ?? 0} unidades</p>
                    <p><strong>Costo actual:</strong> ${selectedProduct.costPrice?.toFixed(2) ?? "N/A"}</p>
                  </div>
                )}
              </div>

              {/* Cantidad y Costo Unitario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block mb-1 font-medium">
                    Cantidad <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="0"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      handleInputChange("quantity", parseInt(e.target.value) || 0)
                    }
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="unitCost" className="block mb-1 font-medium">
                    Costo Unitario <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="unitCost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.unitCost || ""}
                    onChange={(e) =>
                      handleInputChange("unitCost", parseFloat(e.target.value) || 0)
                    }
                  />
                  {errors.unitCost && (
                    <p className="mt-1 text-sm text-red-600">{errors.unitCost}</p>
                  )}
                </div>
              </div>

              {/* Costo Total (solo lectura) */}
              <div className="rounded border border-gray-300 bg-gray-50 px-3 py-2">
                <p className="text-sm font-medium text-gray-600">Costo Total</p>
                <p className="text-xl font-bold text-gray-900">
                  ${totalCost.toFixed(2)}
                </p>
              </div>

              {/* Tipo de Referencia */}
              <div>
                <label className="block mb-1 font-medium" htmlFor="referenceType">
                  Tipo de Movimiento <span className="text-red-600">*</span>
                </label>
                <SelectPrimitive.Root
                  value={formData.referenceType.toString()}
                  onValueChange={(val) => handleInputChange("referenceType", Number(val) as StockReferenceType)}
                >
                  <SelectPrimitive.Trigger
                    id="referenceType"
                    className="inline-flex items-center justify-between w-full rounded border border-gray-300 px-3 py-2 text-left text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Selecciona un tipo de movimiento"
                  >
                    <SelectPrimitive.Value />
                    <SelectPrimitive.Icon>
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        className="ml-2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </SelectPrimitive.Icon>
                  </SelectPrimitive.Trigger>

                  <SelectPrimitive.Content
                    sideOffset={5}
                    className="overflow-hidden rounded-md border border-gray-300 bg-white shadow-md z-50"
                  >
                    <SelectPrimitive.ScrollUpButton />
                    <SelectPrimitive.Viewport>
                      <SelectPrimitive.Item
                        value={StockReferenceType.Purchase.toString()}
                        className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-gray-700 data-[highlighted]:bg-green-600 data-[highlighted]:text-white"
                      >
                        <SelectPrimitive.ItemText>
                          Compra (Entrada de stock)
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                      <SelectPrimitive.Item
                        value={StockReferenceType.Sale.toString()}
                        className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-gray-700 data-[highlighted]:bg-green-600 data-[highlighted]:text-white"
                      >
                        <SelectPrimitive.ItemText>
                          Venta (Salida de stock)
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                      <SelectPrimitive.Item
                        value={StockReferenceType.Adjustment.toString()}
                        className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-gray-700 data-[highlighted]:bg-green-600 data-[highlighted]:text-white"
                      >
                        <SelectPrimitive.ItemText>
                          Ajuste (Entrada/Salida manual)
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                    </SelectPrimitive.Viewport>
                    <SelectPrimitive.ScrollDownButton />
                  </SelectPrimitive.Content>
                </SelectPrimitive.Root>
                {errors.referenceType && (
                  <p className="mt-1 text-sm text-red-600">{errors.referenceType}</p>
                )}
              </div>

              {/* ID de Referencia (opcional) */}
              <div>
                <label htmlFor="referenceId" className="block mb-1 font-medium">
                  ID de Referencia <span className="text-gray-500">(opcional)</span>
                </label>
                <input
                  id="referenceId"
                  type="number"
                  min="0"
                  placeholder="Ej: número de factura"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.referenceId || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "referenceId",
                      e.target.value ? parseInt(e.target.value) : 0
                    )
                  }
                />
              </div>

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
                  {isSubmitting ? "Guardando..." : "Registrar Entrada"}
                </button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
