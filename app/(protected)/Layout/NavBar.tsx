"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
  Button,
} from "@heroui/react";
import {
  VscAccount,
  VscSettingsGear,
  VscQuestion,
  VscSignOut,
  VscColorMode,
  VscListSelection, // ícono hamburguesa más estándar
} from "react-icons/vsc";
import { UserResponse } from "@/types/user";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface Props {
  user: UserResponse | null;
  onLogout: () => void;
  onToggleSidebar: () => void; // para el toggle sidebar en móvil
}

export default function AppNavBar({ user, onLogout, onToggleSidebar }: Props) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !user) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Navbar
      maxWidth="full"
      height="80px"
      className="
        bg-[var(--color-page)]
        border-b border-black/10
        px-4 md:px-6
        dark:bg-[var(--color-page-dark)]
        flex items-center
      "
    >
      {/* BOTÓN HAMBURGUESA visible solo en móviles */}
      <Button
        isIconOnly
        variant="light"
        className="md:hidden mr-4 rounded-xl"
        onPress={onToggleSidebar}
        aria-label="Toggle sidebar"
        title="Mostrar menú"
      >
        <VscListSelection className="text-xl" />
      </Button>

      {/* BRAND */}
      <NavbarBrand className="flex items-center gap-4 flex-shrink-0">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow select-none">
          G
        </div>

        <div className="leading-tight hidden sm:block">
          <p className="font-semibold text-lg tracking-tight select-none">
            Galaxium ERP
          </p>
          <p className="text-xs text-default-400 select-none">Enterprise Platform</p>
        </div>
      </NavbarBrand>

      {/* Spacer para empujar el contenido a la derecha */}
      <div className="flex-grow" />

      {/* RIGHT (botones y dropdown) */}
      <NavbarContent justify="end" className="gap-3 items-center">
        {/* 🌙 DARK / LIGHT MODE */}
        <Button
          isIconOnly
          variant="light"
          onPress={toggleTheme}
          className="rounded-xl"
          aria-label="Toggle Dark Mode"
          title="Cambiar tema"
        >
          <VscColorMode className="text-xl" />
        </Button>

        {/* 👤 USER MENU */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <div
              className="
                flex items-center gap-3
                px-3 py-2
                rounded-xl
                cursor-pointer
                hover:bg-black/5 dark:hover:bg-white/10
                transition
                select-none
              "
            >
              <Avatar
                size="sm"
                name={user.username}
                className="bg-indigo-600 text-white"
              />

              {/* Solo mostrar nombre y rol en pantallas medianas hacia arriba */}
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-none">{user.username}</p>
                <p className="text-xs text-default-400">Administrador</p>
              </div>
            </div>
          </DropdownTrigger>

          <DropdownMenu
            aria-label="User menu"
            variant="flat"
            className="w-64 shadow-xl border border-black/10 bg-[var(--color-page)] dark:bg-[var(--color-page-dark)]"
          >
            <DropdownSection showDivider>
              <DropdownItem key="profile" startContent={<VscAccount className="text-lg" />}>
                Mi perfil
              </DropdownItem>

              <DropdownItem key="settings" startContent={<VscSettingsGear className="text-lg" />}>
                Configuración
              </DropdownItem>

              <DropdownItem key="support" startContent={<VscQuestion className="text-lg" />}>
                Soporte
              </DropdownItem>
            </DropdownSection>

            <DropdownSection>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<VscSignOut className="text-lg text-danger" />}
                onPress={onLogout}
              >
                Cerrar sesión
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
