"use client";

import { BaseModal } from "./BaseModal";
import { ReactNode } from "react";

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: () => void;
  submitText?: string;
  children: ReactNode;
}

export function FormModal({
  open,
  onOpenChange,
  title,
  onSubmit,
  submitText = "Guardar",
  children,
}: FormModalProps) {
  return (
    <BaseModal open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-4">{children}</div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 border rounded hover:bg-gray-100 cursor-pointer "
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-(--color-button-bg) text-white rounded hover:bg-(--color-button-hover-bg) cursor-pointer"
        >
          {submitText}
        </button>
      </div>
    </BaseModal>
  );
}
