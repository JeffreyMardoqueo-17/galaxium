"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ArrowLeft, CheckCircle2, Loader2, ScanLine } from "lucide-react";

import { ProductCreateRequest, ProductResponse } from "@/types/product";
import { CategoryRead } from "@/types/category";
import BarcodeScanner from "@/components/features/BarcodeScanner";
import { ProductPhotoForm } from "@/components/features/products/ProductPhotoForm";
import { createProduct, getProductsByFilter } from "@/services/product.service";
import { getCategories } from "@/services/category.service";

export default function AddProductPage() {
  const router = useRouter();

  // ===============================
  // STATE
  // ===============================
  const [categories, setCategories] = React.useState<CategoryRead[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createdProductId, setCreatedProductId] = React.useState<number | null>(
    null,
  );
  const [showPhotoStep, setShowPhotoStep] = React.useState(false);

  // Scanner state
  const [scannedCode, setScannedCode] = React.useState<string>("");
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);
  
  // Barcode validation state
  const [duplicateProduct, setDuplicateProduct] = React.useState<ProductResponse | null>(null);
  const [checkingBarcode, setCheckingBarcode] = React.useState(false);

  const [formData, setFormData] = React.useState({
    categoryId: 0,
    name: "",
    barcode: "",
    minimumStock: 0,
  });

  const [errors, setErrors] = React.useState<
    Partial<Record<string, string>>
  >({});

  // ===============================
  // LOAD CATEGORIES
  // ===============================
  React.useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error cargando categorías", error);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // ===============================
  // BARCODE VALIDATION
  // ===============================
  const checkBarcodeExists = React.useCallback(async (barcode: string) => {
    if (!barcode || barcode.trim() === "") {
      setDuplicateProduct(null);
      return;
    }

    setCheckingBarcode(true);
    try {
      const products = await getProductsByFilter({
        barCode: barcode.trim(),
        pageSize: 100,
      });

      if (products && products.length > 0) {
        const normalizedBarcode = barcode.trim().toLowerCase();
        const exactMatch = products.find(
          (product) => product.barcode?.toLowerCase() === normalizedBarcode,
        );

        setDuplicateProduct(exactMatch ?? null);
      } else {
        setDuplicateProduct(null);
      }
    } catch (error) {
      console.error("Error verificando código de barras:", error);
      setDuplicateProduct(null);
    } finally {
      setCheckingBarcode(false);
    }
  }, []);

  // Debounce para validación al escribir manualmente
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.barcode) {
        checkBarcodeExists(formData.barcode);
      } else {
        setDuplicateProduct(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.barcode, checkBarcodeExists]);

  // ===============================
  // BARCODE SCANNER
  // ===============================
  const handleBarcodeDetected = (code: string) => {
    setScannedCode(code);
    handleInputChange("barcode", code);
    checkBarcodeExists(code); // Validar inmediatamente al escanear
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 50);
  };

  const handleScannerError = (message: string) => {
    alert(message);
  };

  // ===============================
  // VALIDATION
  // ===============================
  function validateForm() {
    const newErrors: Partial<Record<string, string>> = {};

    if (!formData.categoryId || formData.categoryId === 0)
      newErrors.categoryId = "La categoría es requerida";
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (formData.minimumStock < 0)
      newErrors.minimumStock = "El stock mínimo no puede ser negativo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ===============================
  // SUBMIT
  // ===============================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validar que no haya código duplicado
    if (duplicateProduct) {
      alert(
        `❌ No se puede registrar el producto\n\n` +
        `El código de barras "${formData.barcode}" ya está siendo usado por:\n` +
        `"${duplicateProduct.name}"\n\n` +
        `Por favor, usa un código de barras diferente o verifica el producto existente.`
      );
      return;
    }
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const productData: ProductCreateRequest = {
        categoryId: formData.categoryId,
        name: formData.name,
        barcode: formData.barcode || undefined,
        minimumStock: formData.minimumStock,
        costPrice: null,
        salePrice: null,
        initialStock: 0,
        isActive: true,
      };

      const result = await createProduct(productData);
      const createdId = typeof result === "number" ? result : result?.id;

      if (createdId) {
        setCreatedProductId(createdId);
      }
    } catch (error) {
      console.error("Error creando producto:", error);
      alert("Error al crear el producto. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ===============================
  // INPUT CHANGE
  // ===============================
  function handleInputChange(
    field: string,
    value: string | number | boolean,
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  // ===============================
  // RENDER: SUCCESS STATE
  // ===============================
  if (createdProductId && !showPhotoStep) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Producto Creado!
              </h2>
              <p className="text-gray-600">
                El producto se registró exitosamente en el inventario.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => setShowPhotoStep(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-semibold text-sm"
              >
                📸 Subir Fotos
              </button>

              <button
                onClick={() => router.push("/product")}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-sm"
              >
                Ver Productos
              </button>

              <button
                onClick={() => {
                  setCreatedProductId(null);
                  setFormData({
                    categoryId: 0,
                    name: "",
                    barcode: "",
                    minimumStock: 0,
                  });
                  setScannedCode("");
                  setDuplicateProduct(null);
                  setErrors({});
                }}
                className="w-full px-6 py-3 text-purple-600 hover:bg-purple-50 rounded-lg transition font-semibold text-sm"
              >
                ➕ Crear Otro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // RENDER: PHOTO UPLOAD STATE
  // ===============================
  if (showPhotoStep && createdProductId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setShowPhotoStep(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 md:px-8 py-8 border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900">
                📸 Agregar Fotos
              </h2>
              <p className="text-gray-600 mt-2">
                Sube fotos de tu producto (opcional)
              </p>
            </div>

            <div className="p-6 md:p-8">
              <ProductPhotoForm
                productId={createdProductId}
                onUploaded={() => {
                  router.push("/product");
                }}
              />

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => router.push("/product")}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-semibold"
                >
                  Terminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // RENDER: MAIN FORM
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/product")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            Crear Nuevo Producto
          </h1>
          <p className="text-gray-600 mt-2">
            Escanea el código de barras o completa los datos manualmente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: SCANNER */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Scanner Header */}
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <ScanLine className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Código de Barras
                  </h2>
                </div>
              </div>

              {/* Scanner Content */}
              <div className="p-6">
                <BarcodeScanner
                  onDetected={handleBarcodeDetected}
                  onError={handleScannerError}
                />

                {scannedCode && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-900">
                        Código escaneado
                      </p>
                      <p className="text-sm text-green-800 font-mono">
                        {scannedCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: FORM */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Categoría <span className="text-red-500">*</span>
                </label>
                <SelectPrimitive.Root
                  value={
                    formData.categoryId ? formData.categoryId.toString() : ""
                  }
                  onValueChange={(val) =>
                    handleInputChange("categoryId", Number(val))
                  }
                  disabled={loadingCategories}
                >
                  <SelectPrimitive.Trigger
                    id="category"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SelectPrimitive.Value placeholder="Selecciona una categoría" />
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
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </SelectPrimitive.Icon>
                  </SelectPrimitive.Trigger>

                  <SelectPrimitive.Content className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl z-50">
                    <SelectPrimitive.Viewport>
                      {categories.map((cat) => (
                        <SelectPrimitive.Item
                          key={cat.id}
                          value={cat.id.toString()}
                          className="relative flex cursor-pointer select-none items-center rounded px-3 py-2.5 text-gray-900 hover:bg-purple-50 data-[highlighted]:bg-purple-600 data-[highlighted]:text-white transition mx-1 my-1"
                        >
                          <SelectPrimitive.ItemText>
                            {cat.name}
                          </SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectPrimitive.Viewport>
                  </SelectPrimitive.Content>
                </SelectPrimitive.Root>
                {errors.categoryId && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ej: Laptop HP 15"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition hover:border-gray-400"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Barcode Field */}
              <div>
                <label
                  htmlFor="barcode"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Código de Barras
                </label>
                <div className="relative">
                  <input
                    ref={barcodeInputRef}
                    id="barcode"
                    type="text"
                    placeholder="Escanea o escribe el código"
                    className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition hover:border-gray-400 pr-10 ${
                      duplicateProduct 
                        ? 'border-red-400 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                    }`}
                    value={formData.barcode ?? ""}
                    onChange={(e) => handleInputChange("barcode", e.target.value)}
                  />
                  {checkingBarcode && formData.barcode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                  {!checkingBarcode && formData.barcode && !duplicateProduct && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {!checkingBarcode && duplicateProduct && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {duplicateProduct && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-900">
                          ⚠️ Código de barras duplicado
                        </p>
                        <p className="text-xs text-red-800 mt-1">
                          Este código ya está registrado con el producto:{" "}
                          <span className="font-bold">"{duplicateProduct.name}"</span>
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          SKU: {duplicateProduct.sku} • Categoría: {duplicateProduct.categoryName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!duplicateProduct && !checkingBarcode && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    💡 Haz clic en el botón del escáner o escribe manualmente
                  </p>
                )}
              </div>

              {/* Stock Mínimo */}
              <div>
                <label
                  htmlFor="minimumStock"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Stock Mínimo <span className="text-red-500">*</span>
                </label>
                <input
                  id="minimumStock"
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition hover:border-gray-400"
                  value={formData.minimumStock ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "minimumStock",
                      e.target.value === "" ? 0 : parseInt(e.target.value),
                    )
                  }
                />
                {errors.minimumStock && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {errors.minimumStock}
                  </p>
                )}
              </div>

              {/* Separator */}
              <div className="h-px bg-gray-200"></div>

              {/* Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !!duplicateProduct}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : duplicateProduct ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                      Código Duplicado
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Crear Producto
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/product")}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition font-semibold text-sm"
                >
                  Cancelar
                </button>
              </div>

              {/* Info Text */}
              <p className="text-xs text-gray-600 text-center">
                Después podrás editar precios y agregar fotos
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
