"use client";

import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  isDirty?: boolean; // <--- Nuevo prop para saber si el formulario tiene cambios sin guardar
}

export function CustomModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Guardar",
  isDirty = false,
}: CustomModalProps) {
  function canClose(): boolean {
    if (!isDirty) return true;
    return confirm("Tienes cambios sin guardar. ¿Seguro que quieres cerrar?");
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          if (!canClose()) return;
          onClose();
        }
      }}
    >
      <DialogContent className="w-[95%] max-w-200" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <section className="max-h-[65vh] overflow-auto">{children}</section>

        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              if (!canClose()) return;
              onClose();
            }}
            className="rounded-md border border-border px-5 py-2 hover:bg-muted"
          >
            Cancelar
          </button>

          {onSubmit && (
            <button
              type="button"
              onClick={() => {
                onSubmit();
                onClose();
              }}
              className="rounded-md bg-primary px-6 py-2 font-semibold text-primary-foreground hover:opacity-90"
            >
              {submitText}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
