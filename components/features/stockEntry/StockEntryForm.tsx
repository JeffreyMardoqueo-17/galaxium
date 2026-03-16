"use client";

import * as React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/30 font-semibold text-sm transition-all duration-150">
          <Plus className="w-4 h-4" /> Nueva Entrada de Stock
        </button>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-5xl" showCloseButton={false}>
            <div className="bg-linear-to-r from-emerald-600 to-teal-600 px-6 pt-6 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white leading-tight">
                      Registrar Entrada de Stock
                    </DialogTitle>
                    <DialogDescription className="text-emerald-100 text-xs mt-0.5">
                      Actualiza el inventario y costo de tus productos
                    </DialogDescription>
                  </div>
                </div>
                <DialogClose asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </DialogClose>
              </div>
            </div>
            <div className="p-6">

            {/* ESCÁNER */}
            {showScanner && (
              <div className="mb-5 p-4 bg-sky-50 border-2 border-sky-200 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sky-800 text-sm">Escanear Código de Barras</h3>
                  <button
                    type="button"
                    onClick={() => setShowScanner(false)}
                    className="text-sky-400 hover:text-sky-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <BarcodeScanner
                  onDetected={handleBarcodeDetected}
                  onError={handleScannerError}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                              className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b last:border-b-0 transition flex justify-between items-center"
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
                              <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-semibold">
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

                  <div className="col-span-1.5">
                    <input
                      type="number"
                      min="1"
                      placeholder="Cantidad"
                      className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all text-sm"
                      value={formData.quantity || ""}
                      onChange={(e) =>
                        handleInputChange("quantity", parseInt(e.target.value) || 0)
                      }
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.quantity}</p>
                    )}
                  </div>

                  {/* Costo Unitario */}
                  <div className="col-span-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Costo Unitario"
                      className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all text-sm"
                      value={formData.unitCost || ""}
                      onChange={(e) =>
                        handleInputChange("unitCost", parseFloat(e.target.value) || 0)
                      }
                    />
                    {errors.unitCost && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.unitCost}</p>
                    )}
                  </div>

                  {/* Botón Escáner */}
                  <button
                    type="button"
                    onClick={() => setShowScanner(!showScanner)}
                    className="col-span-1 flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition font-semibold h-full shadow-sm shadow-sky-600/30 text-sm"
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
                <div className="rounded-xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 px-4 py-3">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Costo Total</p>
                  <p className="text-2xl font-bold text-emerald-900">
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
                      className="inline-flex items-center justify-between w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm text-gray-700 hover:border-sky-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
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
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-60"
                    >
                      <SelectPrimitive.Viewport className="p-1">
                        <SelectPrimitive.Item
                          value={StockReferenceType.Purchase.toString()}
                          className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 data-highlighted:bg-sky-600 data-highlighted:text-white outline-none transition-colors"
                        >
                          <SelectPrimitive.ItemText>📥 Compra</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                        <SelectPrimitive.Item
                          value={StockReferenceType.Sale.toString()}
                          className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 data-highlighted:bg-sky-600 data-highlighted:text-white outline-none transition-colors"
                        >
                          <SelectPrimitive.ItemText>📤 Venta</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                        <SelectPrimitive.Item
                          value={StockReferenceType.Adjustment.toString()}
                          className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 data-highlighted:bg-sky-600 data-highlighted:text-white outline-none transition-colors"
                        >
                          <SelectPrimitive.ItemText>⚙️ Ajuste</SelectPrimitive.ItemText>
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
                    className="w-full px-3 py-2.5 border-2 border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all text-sm"
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
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold disabled:opacity-50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm shadow-emerald-600/30"
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
          </div>
      </DialogContent>
    </Dialog>
  );
}

