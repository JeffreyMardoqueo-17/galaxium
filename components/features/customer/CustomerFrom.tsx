"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import {CustomerCreateRequestDTO} from "@/types/custoner"



interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreate: (customer: CustomerCreateRequestDTO) => Promise<void> | void;
}

export function CreateCustomerModal({
  open,
  onOpenChange,
  onCustomerCreate,
}: CreateCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<CustomerCreateRequestDTO>({
    fullName: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof CustomerCreateRequestDTO, string>>>({});

  function validateForm() {
    const newErrors: Partial<Record<keyof CustomerCreateRequestDTO, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "El nombre completo es requerido";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Correo electrónico inválido";
    if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone.replace(/\s+/g, "")))
      newErrors.phone = "Número de teléfono inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onCustomerCreate(formData);
      setFormData({ fullName: "", phone: "", email: "" });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error("Error creando cliente:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInputChange(
    field: keyof CustomerCreateRequestDTO,
    value: string | null
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          <Plus className="mr-2 w-4 h-4" /> Nuevo Cliente
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPrimitive.Content className="relative max-w-md w-full rounded-md bg-white p-6 shadow-lg focus:outline-none">
            <DialogPrimitive.Title className="text-lg font-semibold mb-2">
              Crear Nuevo Cliente
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mb-4 text-sm text-gray-600">
              Completa los datos para registrar un nuevo cliente.
            </DialogPrimitive.Description>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block mb-1 font-medium">
                  Nombre Completo <span className="text-red-600">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Ej: Jeffrey"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block mb-1 font-medium">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+503 1234 5678"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
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
                  {isSubmitting ? "Guardando..." : "Guardar Cliente"}
                </button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
