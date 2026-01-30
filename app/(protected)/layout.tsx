"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Llamada al backend para revocar refresh token y limpiar cookies HttpOnly
      await fetch("http://localhost:5213/api/User/logout", {
        method: "POST",
        credentials: "include", // Importante para enviar las cookies
      });

      // Limpiar el estado local (localStorage, cookies no HttpOnly)
      logout();

      // Redirigir a login para que el usuario vuelva a autenticarse
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col">
        <div className="px-6 py-4 text-2xl font-bold border-b border-blue-700">
          MyApp
        </div>
        <nav className="flex flex-col flex-grow p-4 space-y-2">
          <a
            href="/"
            className="px-3 py-2 rounded hover:bg-blue-700 transition"
          >
            Dashboard
          </a>
          <a
            href="/users"
            className="px-3 py-2 rounded hover:bg-blue-700 transition"
          >
            Users
          </a>
          <a
            href="/ventas"
            className="px-3 py-2 rounded hover:bg-blue-700 transition"
          >
            Ventas
          </a>
        </nav>
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-grow">
        {/* Header */}
        <header className="h-16 bg-white shadow flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-700">Dashboard</h1>
        </header>

        {/* Content area */}
        <main className="flex-grow p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
