"use client";

import { SIDEBAR_ITEMS } from "@/config/sidebar";
import { useRouter } from "next/navigation";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const router = useRouter();

  return (
    <>
      {/* Backdrop móvil con blur */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{
          backgroundColor: isOpen ? "rgba(0, 0, 0, 0.3)" : "transparent",
          backdropFilter: isOpen ? "blur(10px)" : "none",
          WebkitBackdropFilter: isOpen ? "blur(10px)" : "none",
        }}
      />

      <aside
        className={`
          fixed top-0 right-0 bottom-0
          w-64
          bg-(--color-sidebar)
          text-white
          flex flex-col
          z-50
          transform transition-transform duration-300 ease-in-out
          
          md:static md:translate-x-0 md:w-52 md:rounded-r-xl
          
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* BRAND */}
        <div className="px-6 py-4 text-xl font-semibold border-b border-white/10 flex justify-between items-center">
          <span>Galaxium ERP</span>
          {/* Botón cerrar solo en móvil */}
          <button
            onClick={onClose}
            className="md:hidden text-white text-2xl font-bold focus:outline-none"
            aria-label="Cerrar menú"
          >
            &times;
          </button>
        </div>

        {/* MENU */}
        <nav className="flex flex-col grow p-1 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                className="
                  flex items-center gap-3 px-3 py-2  text-left
                  hover:bg-(--color-sidebar-hover)
                  transition
                  w-full
                "
              >
                <Icon className="w-5 h-5 text-white/80" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
