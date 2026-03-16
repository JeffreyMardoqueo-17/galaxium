"use client";

import * as React from "react";
import { X, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerCreateRequestDTO } from "@/types/custoner";

interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreate: (
    customer: CustomerCreateRequestDTO
  ) => Promise<void>;
}

export function CreateCustomerModal({
  open,
  onOpenChange,
  onCustomerCreate,
}: CreateCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] =
    React.useState<CustomerCreateRequestDTO>({
      fullName: "",
      phone: "",
      email: "",
    });

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof CustomerCreateRequestDTO, string>>
  >({});

  const [apiError, setApiError] = React.useState<string | null>(null);

  /* ===========================
     VALIDACIÓN FRONTEND
     =========================== */
  function validateForm(): boolean {
    const newErrors: Partial<
      Record<keyof CustomerCreateRequestDTO, string>
    > = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido";
    }

    if (
      formData.email &&
      !/\S+@\S+\.\S+/.test(formData.email)
    ) {
      newErrors.email = "Correo electrónico inválido";
    }

    if (
      formData.phone &&
      !/^\+?\d{7,15}$/.test(formData.phone.replace(/\s+/g, ""))
    ) {
      newErrors.phone = "Número de teléfono inválido";
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
      await onCustomerCreate(formData);

      // Limpiar solo si TODO salió bien
      setFormData({ fullName: "", phone: "", email: "" });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error("Error creando cliente:", error);

      // ✅ FETCH: el mensaje REAL viene en error.message
      const message =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear el cliente.";

      setApiError(message);

      // Marcar campo específico según mensaje del backend
      if (message.toLowerCase().includes("correo")) {
        setErrors((prev) => ({
          ...prev,
          email: message,
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ===========================
     INPUT CHANGE
     =========================== */
  function handleInputChange(
    field: keyof CustomerCreateRequestDTO,
    value: string
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    if (apiError) setApiError(null);
  }
  /* ===========================
     UI
     =========================== */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-md" showCloseButton={false}>
        {/* Header degradado sidebar */}
        <div className="bg-linear-to-r from-sky-600 to-cyan-600 px-6 pt-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">
                  Crear Nuevo Cliente
                </DialogTitle>
                <DialogDescription className="text-sky-200 text-xs mt-0.5">
                  Completa los datos para registrar un nuevo cliente.
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6">

            {apiError && (
              <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiError}
              </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block mb-1 font-medium">
                  Nombre Completo <span className="text-red-600">*</span>
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ej: Jeffrey"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
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
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+503 1234 5678"
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
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cliente"}
                </Button>
              </div>
            </form>
          </div>
      </DialogContent>
    </Dialog>
  );
}

