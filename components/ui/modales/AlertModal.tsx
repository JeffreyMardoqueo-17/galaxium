"use client";

import { BaseModal } from "./BaseModal";

type AlertType = "success" | "error" | "warning";

type AlertModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  type?: AlertType;
};

const COLORS: Record<AlertType, string> = {
  success: "var(--color-success)",
  error: "var(--color-danger)",
  warning: "var(--color-warning)",
};

export function AlertModal({
  open,
  onOpenChange,
  title,
  message,
  type = "success",
}: AlertModalProps) {
  return (
    <BaseModal open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex flex-col gap-4">
        <p
          className="text-sm"
          style={{ color: COLORS[type] }}
        >
          {message}
        </p>

        <div className="flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg bg-(--color-page) border border-black/10"
          >
            Aceptar
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
