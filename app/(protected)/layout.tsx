"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";
import { SIDEBAR_ITEMS } from "@/config/sidebar";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/user.service";
import { UserResponse } from "@/types/user"
import { HeroUIProvider } from "@heroui/react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5213/api/User/logout", {
        method: "POST",
        credentials: "include",
      });

      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  //// PARA OBTENER AL USUARIO ACTUAL
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <HeroUIProvider>
    <div className="flex h-screen bg-(--color-body)">
      {/* ======================
          SIDEBAR
      ====================== */}
      <aside className="w-52 bg-(--color-sidebar) text-white flex flex-col">
        <div className="px-6 py-4 text-xl font-semibold border-b border-white/10">
          Galaxium ERP
        </div>

        <nav className="flex flex-col grow p-1 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className="
          flex items-center gap-3 px-3 py-2 rounded-lg
          hover:bg-(--color-sidebar-hover) transition
        "
              >
                <Icon className="w-5 h-5 text-white/80" />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg bg-(--color-sidebar-hover) hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ======================
          MAIN
      ====================== */}
      <div className="flex flex-col grow">
        <header className="h-16 bg-(--color-page) shadow-card flex items-center px-6">
          <h1 className="text-xl font-semibold text-(--color-text-title)">
            Dashboard
          </h1>
          {user ? (
            <>
              <h1 className="px-4 text-lg font-light text-(--color-sidebar)">
                {user.username}
              </h1>
            </>
          ) : (
            <p>No se pudo cargar el usuario</p>
          )}
        </header>

        <main className="flex flex-col grow p-6 overflow-auto">
          <div className="bg-(--color-page) rounded-2xl shadow-card p-6">
            {children}
          </div>
        </main>
      </div>
      </div>
    </HeroUIProvider>
  );
}
