"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Plus, Barcode, X } from "lucide-react";

import { StockEntryCreate, StockReferenceType } from "@/types/StockEntry";
import { ProductResponse } from "@/types/product";
import BarcodeScanner from "@/components/features/BarcodeScanner";

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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showProductList, setShowProductList] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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

  // Filtrar productos por nombre o código de barras
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.barcode?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Cerrar lista de productos cuando se seleccione uno
  React.useEffect(() => {
    if (formData.productId > 0) {
      setShowProductList(false);
      setSearchQuery("");
    }
  }, [formData.productId]);

  const handleSelectProduct = (productId: number) => {
    handleInputChange("productId", productId);
    setShowProductList(false);
  };

  const handleBarcodeDetected = (code: string) => {
    console.log("[STOCK] Código detectado:", code);
    setSearchQuery(code);
    setShowScanner(false);

    // Buscar producto por código
    const product = products.find(
      (p) => p.barcode?.toLowerCase() === code.toLowerCase()
    );
    if (product) {
      handleSelectProduct(product.id);
    } else {
      alert(`No se encontró producto con código: ${code}`);
    }
  };

  const handleScannerError = (message: string) => {
    console.error("[STOCK] Error escáner:", message);
    alert(`Error: ${message}`);
  };

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
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <DialogPrimitive.Content
            className="relative w-full max-w-6xl rounded-xl bg-white p-8 shadow-2xl focus:outline-none my-8"
          >
            <div className="flex items-center justify-between mb-2">
              <DialogPrimitive.Title className="text-2xl font-bold text-gray-900">
                📦 Registrar Entrada de Stock
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <button className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </DialogPrimitive.Close>
            </div>
            <DialogPrimitive.Description className="mb-6 text-sm text-gray-600">
              Actualiza el inventario y costo de tus productos
            </DialogPrimitive.Description>

            {/* ESCÁNER */}
            {showScanner && (
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-blue-900">Escanear Código de Barras</h3>
                  <button
                    type="button"
                    onClick={() => setShowScanner(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <BarcodeScanner
                  onDetected={handleBarcodeDetected}
                  onError={handleScannerError}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PRODUCTO - Input Searchable con CANTIDAD y COSTO */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Producto <span className="text-red-600">*</span> | Cantidad | Costo Unitario
                </label>
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-3 relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Busca por nombre o código de barras..."
                      value={
                        formData.productId > 0 && selectedProduct
                          ? `${selectedProduct.name} (${selectedProduct.sku || 'N/A'})`
                          : searchQuery
                      }
                      onChange={(e) => {
                        if (formData.productId > 0) {
                          setFormData((prev) => ({ ...prev, productId: 0 }));
                        }
                        setSearchQuery(e.target.value);
                        setShowProductList(true);
                      }}
                      onFocus={() => setShowProductList(true)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    />
                    {formData.productId > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, productId: 0 }));
                          setSearchQuery("");
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Dropdown de productos filtrados */}
                    {showProductList && !formData.productId && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((prod) => (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => handleSelectProduct(prod.id)}
                              className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b last:border-b-0 transition flex justify-between items-center"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">{prod.name}</p>
                                  {!prod.isActive && (
                                    <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded font-semibold">
                                      Inactivo
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  SKU: {prod.sku || 'N/A'} | Código: {prod.barcode || 'N/A'}
                                </p>
                              </div>
                              <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                Stock: {prod.stock ?? 0}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500">
                            No se encontraron productos
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div className="col-span-1.5">
                    <input
                      type="number"
                      min="1"
                      placeholder="Cantidad"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                      value={formData.quantity || ""}
                      onChange={(e) =>
                        handleInputChange("quantity", parseInt(e.target.value) || 0)
                      }
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.quantity}</p>
                    )}
                  </div>

                  {/* Costo Unitario */}
                  <div className="col-span-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Costo Unitario"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                      value={formData.unitCost || ""}
                      onChange={(e) =>
                        handleInputChange("unitCost", parseFloat(e.target.value) || 0)
                      }
                    />
                    {errors.unitCost && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.unitCost}</p>
                    )}
                  </div>

                  {/* Botón Escáner */}
                  <button
                    type="button"
                    onClick={() => setShowScanner(!showScanner)}
                    className="col-span-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium h-full"
                    title="Escanear código de barras"
                  >
                    <Barcode className="w-5 h-5" />
                    <span className="text-sm">Escanear</span>
                  </button>
                </div>

                {/* Errores y advertencias */}
                {errors.productId && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{errors.productId}</p>
                )}

                {selectedProduct && !selectedProduct.salePrice && (
                  <div className="mt-2 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 px-4 py-2 text-xs text-yellow-800">
                    <p className="font-semibold">⚠️ Advertencia: Sin precio de venta</p>
                  </div>
                )}

                {selectedProduct && (
                  <div className="mt-2 rounded-lg border-2 border-blue-300 bg-blue-50 px-4 py-2 text-xs text-blue-900">
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <p className="font-semibold text-blue-700 uppercase text-xs">Stock Actual</p>
                        <p className="text-sm font-bold text-blue-900">{selectedProduct.stock ?? 0}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-700 uppercase text-xs">Costo Actual</p>
                        <p className="text-sm font-bold text-blue-900">${selectedProduct.costPrice?.toFixed(2) ?? "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-700 uppercase text-xs">Categoría</p>
                        <p className="text-sm font-bold text-blue-900">{selectedProduct.categoryName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-700 uppercase text-xs">SKU</p>
                        <p className="text-sm font-bold text-blue-900 truncate">{selectedProduct.sku}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Costo Total + Tipo de Movimiento + Referencia */}
              <div className="grid grid-cols-3 gap-3">
                {/* Costo Total (solo lectura) */}
                <div className="rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3">
                  <p className="text-xs font-semibold text-purple-700 uppercase">Costo Total</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${totalCost.toFixed(2)}
                  </p>
                </div>

                {/* Tipo de Referencia */}
                <div>
                  <label className="block mb-1 font-semibold text-gray-700 text-sm" htmlFor="referenceType">
                    Tipo <span className="text-red-600">*</span>
                  </label>
                  <SelectPrimitive.Root
                    value={formData.referenceType.toString()}
                    onValueChange={(val) => handleInputChange("referenceType", Number(val) as StockReferenceType)}
                  >
                    <SelectPrimitive.Trigger
                      id="referenceType"
                      className="inline-flex items-center justify-between w-full rounded-lg border-2 border-gray-300 px-3 py-2.5 text-left text-sm text-gray-700 hover:border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                      aria-label="Selecciona un tipo de movimiento"
                    >
                      <SelectPrimitive.Value />
                      <SelectPrimitive.Icon>
                        <svg
                          width="18"
                          height="18"
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
                      className="overflow-hidden rounded-md border-2 border-gray-300 bg-white shadow-lg z-50"
                    >
                      <SelectPrimitive.ScrollUpButton />
                      <SelectPrimitive.Viewport>
                        <SelectPrimitive.Item
                          value={StockReferenceType.Purchase.toString()}
                          className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2.5 text-sm text-gray-700 data-[highlighted]:bg-purple-600 data-[highlighted]:text-white transition"
                        >
                          <SelectPrimitive.ItemText>
                            📥 Compra
                          </SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                        <SelectPrimitive.Item
                          value={StockReferenceType.Sale.toString()}
                          className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2.5 text-sm text-gray-700 data-[highlighted]:bg-purple-600 data-[highlighted]:text-white transition"
                        >
                          <SelectPrimitive.ItemText>
                            📤 Venta
                          </SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                        <SelectPrimitive.Item
                          value={StockReferenceType.Adjustment.toString()}
                          className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2.5 text-sm text-gray-700 data-[highlighted]:bg-purple-600 data-[highlighted]:text-white transition"
                        >
                          <SelectPrimitive.ItemText>
                            ⚙️ Ajuste
                          </SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      </SelectPrimitive.Viewport>
                      <SelectPrimitive.ScrollDownButton />
                    </SelectPrimitive.Content>
                  </SelectPrimitive.Root>
                  {errors.referenceType && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{errors.referenceType}</p>
                  )}
                </div>

                {/* ID de Referencia (opcional) */}
                <div>
                  <label htmlFor="referenceId" className="block mb-1 font-semibold text-gray-700 text-sm">
                    Referencia
                  </label>
                  <input
                    id="referenceId"
                    type="number"
                    min="0"
                    placeholder="Número factura"
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-sm"
                    value={formData.referenceId || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "referenceId",
                        e.target.value ? parseInt(e.target.value) : 0
                      )
                    }
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-3 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-medium disabled:opacity-50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-semibold disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      ✓ Registrar Entrada
                    </>
                  )}
                </button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
