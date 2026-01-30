"use client";

import { BaseModal } from "./BaseModal";

type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <BaseModal open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex flex-col gap-6">
        <p className="text-sm text-(--color-text-table)">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg border border-black/10"
          >
            Cancelar
          </button>

          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-4 py-2 rounded-lg bg-(--color-danger) text-white"
          >
            Confirmar
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
