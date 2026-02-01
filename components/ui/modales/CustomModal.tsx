"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";

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
  const modalRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState("w-80");

  // ESC para cerrar
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isDirty) {
          if (confirm("Tienes cambios sin guardar. ¿Seguro que quieres cerrar?")) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    }
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, isDirty]);

  // Ajustar ancho con ResizeObserver
  useEffect(() => {
    if (!isOpen) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const widthPx = entry.contentRect.width;
        if (widthPx < 400) setWidth("w-80");
        else if (widthPx < 600) setWidth("w-96");
        else if (widthPx < 700) setWidth("w-[28rem]");
        else setWidth("w-[32rem]");
      }
    });

    if (modalRef.current) resizeObserver.observe(modalRef.current);
    return () => {
      if (modalRef.current) resizeObserver.unobserve(modalRef.current);
    };
  }, [isOpen]);

  // Manejar click fuera del modal
  function handleContainerClick(e: React.MouseEvent<HTMLDivElement>) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      if (isDirty) {
        if (confirm("Tienes un formulario con cambios sin guardar. ¿Quieres cerrar igual?")) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-(--color-overlay) backdrop-blur-[1px] rounded-xl flex items-center justify-center p-6 z-50"
      onClick={handleContainerClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`
          bg-(--color-page) rounded-xl  max-h-[90vh] overflow-auto
          flex flex-col p-6 shadow-lg
          ${width}
          sm:w-[90%] md:max-w-[700px] lg:max-w-[800px]
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="mb-6  border-(--color-border) pb-3">
          <h2
            id="modal-title"
            className="text-(--color-text-title) text-3xl font-bold"
          >
            {title}
          </h2>
        </header>

        {/* Body */}
        <section className="flex-grow overflow-auto mb-6">{children}</section>

        {/* Footer */}
        <footer className="flex justify-end gap-4  border-(--color-border) pt-4">
          <button
            type="button"
            onClick={() => {
              if (isDirty) {
                if (confirm("Tienes cambios sin guardar. ¿Seguro que quieres cerrar?")) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="px-5 py-2 rounded-md border border-gray-300 text-(--color-text-title) hover:bg-(--color-button-hover-bg) transition"
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
              className="px-6 py-2 rounded-md bg-(--color-button-bg) text-white font-semibold hover:bg-(--color-button-hover-bg) transition"
            >
              {submitText}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
