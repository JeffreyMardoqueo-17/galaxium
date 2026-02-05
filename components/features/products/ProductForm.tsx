"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Plus } from "lucide-react";

import { ProductCreateRequest } from "@/types/product";
import { CategoryRead } from "@/types/category";

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryRead[];
  onProductCreate: (product: ProductCreateRequest) => Promise<void> | void;
}

export function CreateProductModal({
  open,
  onOpenChange,
  categories,
  onProductCreate,
}: CreateProductModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<ProductCreateRequest>({
    categoryId: 0,
    name: "",
    costPrice: 0,
    salePrice: 0,
    initialStock: 0,
    minimumStock: 0,
    isActive: true,
  });

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ProductCreateRequest, string>>
  >({});

  function validateForm() {
    const newErrors: Partial<Record<keyof ProductCreateRequest, string>> = {};

    if (!formData.categoryId || formData.categoryId === 0)
      newErrors.categoryId = "La categoría es requerida";
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";

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

    try {
      await onProductCreate(formData);

      setFormData({
        categoryId: 0,
        name: "",
        costPrice: 0,
        salePrice: 0,
        initialStock: 0,
        minimumStock: 0,
        isActive: true,
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error("Error creando producto:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(
    field: keyof ProductCreateRequest,
    value: string | number | boolean
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          <Plus className="mr-2 w-4 h-4" /> Nuevo Producto
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPrimitive.Content
            className="relative max-w-lg w-full rounded-md bg-white p-6 shadow-lg focus:outline-none"
          >
            <DialogPrimitive.Title className="text-lg font-semibold mb-2">
              Crear Nuevo Producto
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mb-4 text-sm text-gray-600">
              Completa el formulario para registrar un nuevo producto en el inventario.
            </DialogPrimitive.Description>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Categoría */}
              <div>
                <label className="block mb-1 font-medium" htmlFor="category">
                  Categoría <span className="text-red-600">*</span>
                </label>
                <SelectPrimitive.Root
                  value={formData.categoryId ? formData.categoryId.toString() : ""}
                  onValueChange={(val) => handleInputChange("categoryId", Number(val))}
                >
                  <SelectPrimitive.Trigger
                    id="category"
                    className="inline-flex items-center justify-between w-full rounded border border-gray-300 px-3 py-2 text-left text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Selecciona una categoría"
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
                        className="ml-2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </SelectPrimitive.Icon>
                  </SelectPrimitive.Trigger>

                  <SelectPrimitive.Content
                    sideOffset={5}
                    className="overflow-hidden rounded-md border border-gray-300 bg-white shadow-md"
                  >
                    <SelectPrimitive.ScrollUpButton />
                    <SelectPrimitive.Viewport>
                      {categories.map((cat) => (
                        <SelectPrimitive.Item
                          key={cat.id}
                          value={cat.id.toString()}
                          className="relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-gray-700 data-[highlighted]:bg-blue-600 data-[highlighted]:text-white"
                        >
                          <SelectPrimitive.ItemText>{cat.name}</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectPrimitive.Viewport>
                    <SelectPrimitive.ScrollDownButton />
                  </SelectPrimitive.Content>
                </SelectPrimitive.Root>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block mb-1 font-medium">
                  Nombre del Producto <span className="text-red-600">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ej: Laptop HP 15"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="costPrice" className="block mb-1 font-medium">
                    Precio de Costo <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.costPrice || ""}
                    onChange={(e) =>
                      handleInputChange("costPrice", parseFloat(e.target.value) || 0)
                    }
                  />
                  {errors.costPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="salePrice" className="block mb-1 font-medium">
                    Precio de Venta <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="salePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.salePrice || ""}
                    onChange={(e) =>
                      handleInputChange("salePrice", parseFloat(e.target.value) || 0)
                    }
                  />
                  {errors.salePrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.salePrice}</p>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-4">
              
                <div>
                  <label htmlFor="minimumStock" className="block mb-1 font-medium">
                    Stock Mínimo <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="minimumStock"
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.minimumStock || ""}
                    onChange={(e) =>
                      handleInputChange("minimumStock", parseInt(e.target.value) || 0)
                    }
                  />
                  {errors.minimumStock && (
                    <p className="mt-1 text-sm text-red-600">{errors.minimumStock}</p>
                  )}
                </div>
                <div className="flex items-center justify-between rounded border p-4">
                <div>
                  <label htmlFor="isActive" className="block font-medium">
                    Producto Activo
                  </label>
                  <p className="text-sm text-gray-600">
                    El producto estará disponible para la venta
                  </p>
                </div>
                <SwitchPrimitive.Root
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  className="w-[42px] h-[25px] bg-gray-200 rounded-full relative cursor-pointer"
                >
                  <SwitchPrimitive.Thumb
                    className="block w-[21px] h-[21px] bg-white rounded-full shadow-md translate-x-0 data-[state=checked]:translate-x-[17px] transition-transform duration-200"
                  />
                </SwitchPrimitive.Root>
              </div>

              </div>

              {/* Switch */}
              
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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Producto"}
                </button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
