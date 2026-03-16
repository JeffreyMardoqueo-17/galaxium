"use client";

import * as React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Plus, Package, Tag, DollarSign, BarChart2, CheckCircle, ImagePlus, PlusCircle, X, Barcode, ScanLine } from "lucide-react";

import { ProductCreateRequest } from "@/types/product";
import { CategoryRead } from "@/types/category";
import { ProductPhotoForm } from "@/components/features/products/ProductPhotoForm";
import BarcodeScanner from "@/components/features/BarcodeScanner";

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryRead[];
  onProductCreate: (
    product: ProductCreateRequest,
  ) => Promise<{ id: number } | number | void> | { id: number } | number | void;
}

type ComboboxOption = {
  id: number;
  label: string;
};

export function CreateProductModal({
  open,
  onOpenChange,
  categories,
  onProductCreate,
}: CreateProductModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createdProductId, setCreatedProductId] = React.useState<number | null>(
    null,
  );
  const [showPhotoStep, setShowPhotoStep] = React.useState(false);
  const [createdMessage, setCreatedMessage] = React.useState<string | null>(
    null,
  );
  const [showScanner, setShowScanner] = React.useState(false);

  const [formData, setFormData] = React.useState<ProductCreateRequest>({
    categoryId: 0,
    name: "",
    barcode: "",
    costPrice: 0,
    salePrice: 0,
    initialStock: 0,
    minimumStock: 0,
    isActive: true,
  });

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ProductCreateRequest, string>>
  >({});

  const categoryOptions = React.useMemo<ComboboxOption[]>(
    () => categories.map((category) => ({ id: category.id, label: category.name })),
    [categories],
  );

  const selectedCategory = React.useMemo(
    () => categoryOptions.find((category) => category.id === formData.categoryId) ?? null,
    [categoryOptions, formData.categoryId],
  );

  const currentCostPrice = formData.costPrice ?? 0;
  const currentSalePrice = formData.salePrice ?? 0;

  const isCreated = createdProductId !== null;

  function validateForm() {
    const newErrors: Partial<Record<keyof ProductCreateRequest, string>> = {};

    if (!formData.categoryId || formData.categoryId === 0)
      newErrors.categoryId = "La categoría es requerida";
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.barcode?.trim()) newErrors.barcode = "El codigo de barras es requerido";

    if (formData.initialStock < 0)
      newErrors.initialStock = "El stock inicial no puede ser negativo";
    if (formData.minimumStock < 0)
      newErrors.minimumStock = "El stock mínimo no puede ser negativo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setCreatedMessage(null);

    try {
      const result = await onProductCreate(formData);
      const createdId = typeof result === "number" ? result : result?.id;

      if (createdId) {
        setCreatedProductId(createdId);
        setCreatedMessage("Producto creado correctamente.");
      } else {
        setCreatedMessage(
          "Producto creado correctamente. Puedes subir la foto más tarde.",
        );
      }
    } catch (error) {
      console.error("Error creando producto:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(
    field: keyof ProductCreateRequest,
    value: string | number | boolean,
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleCreateAnother() {
    setFormData({
      categoryId: 0,
      name: "",
      barcode: "",
      costPrice: 0,
      salePrice: 0,
      initialStock: 0,
      minimumStock: 0,
      isActive: true,
    });
    setErrors({});
    setCreatedProductId(null);
    setShowPhotoStep(false);
    setCreatedMessage(null);
    setShowScanner(false);
  }

  function handleSkipPhoto() {
    onOpenChange(false);
  }

  function handleBarcodeDetected(code: string) {
    handleInputChange("barcode", code.trim());
    setShowScanner(false);
  }

  function handleScannerError(message: string) {
    console.error("[PRODUCT] Scanner error:", message);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 active:bg-sky-800 shadow-sm shadow-sky-600/30 font-semibold text-sm transition-all duration-150">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-5xl" showCloseButton={false}>

            {/* CABECERA con degradado */}
            <div className="bg-linear-to-r from-sky-600 to-cyan-600 px-6 pt-6 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white leading-tight">
                      Nuevo Producto
                    </DialogTitle>
                    <DialogDescription className="text-sky-200 text-xs mt-0.5">
                      Completa los datos para registrar el producto en el inventario
                    </DialogDescription>
                  </div>
                </div>
                <DialogClose asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>
              </div>
            </div>

            {/* CUERPO */}
            <div className="max-h-[86vh] overflow-y-auto p-6">
              {createdMessage && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">{createdMessage}</p>
                </div>
              )}

              {/* ── PASO 1: FORMULARIO ── */}
              {!showPhotoStep && !isCreated && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Sección: Escaneo y código (ancho completo) */}
                  <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ScanLine className="h-4 w-4 text-sky-700" />
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Escaneo obligatorio</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowScanner((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition-colors"
                      >
                        <Barcode className="h-4 w-4" />
                        {showScanner ? "Cerrar escaner" : "Escanear codigo"}
                      </button>
                    </div>

                    {showScanner ? (
                      <div className="mb-3 rounded-xl border border-sky-200 bg-white p-3">
                        <BarcodeScanner
                          onDetected={handleBarcodeDetected}
                          onError={handleScannerError}
                        />
                      </div>
                    ) : null}

                    <label htmlFor="barcode" className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Codigo de barras <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="barcode"
                      type="text"
                      placeholder="Escanea o escribe el codigo"
                      className="w-full rounded-xl border-2 border-sky-200 bg-white px-3 py-2.5 text-sm font-medium tracking-wide focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                      value={formData.barcode ?? ""}
                      onChange={(e) => handleInputChange("barcode", e.target.value)}
                    />
                    <p className="mt-1 text-[11px] text-sky-700/90">
                      Tip: escanea primero y luego completa la informacion del producto.
                    </p>
                    {errors.barcode && <p className="mt-1 text-xs font-medium text-red-500">{errors.barcode}</p>}
                  </div>

                  <div className="grid gap-5 lg:grid-cols-12">
                  <div className="space-y-5 lg:col-span-8">
                    {/* Sección: Información del producto */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-sky-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Informacion del producto</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Categoría */}
                        <div>
                          <label className="block mb-1.5 text-sm font-semibold text-gray-700" htmlFor="category">
                            Categoría <span className="text-red-500">*</span>
                          </label>
                          <Combobox
                            items={categoryOptions}
                            value={selectedCategory}
                            onValueChange={(category: ComboboxOption | null) => handleInputChange("categoryId", category?.id ?? 0)}
                            itemToStringLabel={(category: ComboboxOption | null) => category?.label ?? ""}
                            itemToStringValue={(category: ComboboxOption | null) => category?.id?.toString() ?? ""}
                          >
                            <ComboboxInput
                              id="category"
                              className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 text-sm text-gray-700 transition-all hover:border-sky-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100"
                              aria-label="Selecciona una categoría"
                              placeholder="Selecciona una categoría..."
                              showClear
                            />
                            <ComboboxContent sideOffset={5} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-60">
                              <ComboboxEmpty>No se encontraron categorías</ComboboxEmpty>
                              <ComboboxList className="p-1">
                                {(category: ComboboxOption) => (
                                  <ComboboxItem
                                    key={category.id}
                                    value={category}
                                    className="rounded-lg px-3 py-2.5 text-sm text-gray-700 data-highlighted:bg-sky-600 data-highlighted:text-white"
                                  >
                                    {category.label}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                          {errors.categoryId && <p className="mt-1 text-xs text-red-500 font-medium">{errors.categoryId}</p>}
                        </div>

                        {/* Nombre */}
                        <div>
                          <label htmlFor="name" className="block mb-1.5 text-sm font-semibold text-gray-700">
                            Nombre <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="name"
                            type="text"
                            placeholder="Ej: Laptop HP 15"
                            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-gray-400"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                          />
                          {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Sección: Precios */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Precios</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="costPrice" className="block mb-1.5 text-sm font-semibold text-gray-700">
                            Precio de Costo
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                            <input
                              id="costPrice"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                              value={formData.costPrice || ""}
                              onChange={(e) => handleInputChange("costPrice", parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="salePrice" className="block mb-1.5 text-sm font-semibold text-gray-700">
                            Precio de Venta
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-500">$</span>
                            <input
                              id="salePrice"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                              value={formData.salePrice || ""}
                              onChange={(e) => handleInputChange("salePrice", parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>

                      {currentCostPrice > 0 && currentSalePrice > 0 && (
                        <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                          <BarChart2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <div className="flex gap-4 text-xs">
                            <span className="font-semibold text-emerald-700">
                              Ganancia: <span className="text-emerald-900">${(currentSalePrice - currentCostPrice).toFixed(2)}</span>
                            </span>
                            <span className="font-semibold text-emerald-700">
                              Margen: <span className="text-emerald-900">{(((currentSalePrice - currentCostPrice) / currentCostPrice) * 100).toFixed(1)}%</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5 lg:col-span-4">
                    {/* Sección: Stock */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-cyan-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Inventario</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="initialStock" className="block mb-1.5 text-sm font-semibold text-gray-700">
                            Stock Inicial
                          </label>
                          <input
                            id="initialStock"
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                            value={formData.initialStock ?? ""}
                            onChange={(e) => handleInputChange("initialStock", parseInt(e.target.value) || 0)}
                          />
                          {errors.initialStock && <p className="mt-1 text-xs text-red-500">{errors.initialStock}</p>}
                        </div>
                        <div>
                          <label htmlFor="minimumStock" className="block mb-1.5 text-sm font-semibold text-gray-700">
                            Stock Minimo
                          </label>
                          <input
                            id="minimumStock"
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                            value={formData.minimumStock ?? ""}
                            onChange={(e) => handleInputChange("minimumStock", parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                            Estado
                          </label>
                          <SwitchPrimitive.Root
                            checked={formData.isActive}
                            onCheckedChange={(val) => handleInputChange("isActive", val)}
                            className="flex h-11 w-full items-center gap-2 rounded-xl border-2 border-gray-200 bg-gray-50 px-3 cursor-pointer data-[state=checked]:border-sky-300 data-[state=checked]:bg-sky-50 transition-all"
                          >
                            <SwitchPrimitive.Thumb className="block h-5 w-5 rounded-full bg-gray-400 transition-transform data-[state=checked]:bg-sky-600 data-[state=checked]:translate-x-0" />
                            <span className="text-sm font-medium text-gray-700 data-[state=checked]:text-sky-700">
                              {formData.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </SwitchPrimitive.Root>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end gap-3 border-t border-gray-100 pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 active:bg-sky-800 shadow-sm shadow-sky-600/30 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4" />
                          Guardar Producto
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ── PASO 2: FOTO ── */}
              {!showPhotoStep && isCreated && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-linear-to-br from-sky-50 to-cyan-50 border border-sky-100 p-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 mx-auto mb-3">
                      <ImagePlus className="h-7 w-7" />
                    </div>
                    <p className="font-bold text-gray-800 mb-1">¡Producto creado!</p>
                    <p className="text-sm text-gray-500">¿Deseas subir fotos del producto ahora?</p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCreateAnother}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
                    >
                      <PlusCircle className="h-4 w-4" /> Crear otro
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipPhoto}
                      className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
                    >
                      Omitir
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhotoStep(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 shadow-sm shadow-sky-600/30 transition-all"
                    >
                      <ImagePlus className="h-4 w-4" /> Subir fotos
                    </button>
                  </div>
                </div>
              )}

              {showPhotoStep && createdProductId && (
                <div className="mt-2">
                  <ProductPhotoForm
                    productId={createdProductId}
                    onUploaded={() => {
                      setShowPhotoStep(false);
                      onOpenChange(false);
                    }}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSkipPhoto}
                      className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
      </DialogContent>
    </Dialog>
  );
}

