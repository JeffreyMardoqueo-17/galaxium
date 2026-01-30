"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/user.service";
import { UserResponse } from "@/types/user";

export default function Home() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        {user ? (
          <>
            <h1 className="text-3xl font-bold mb-4">
              👋 Bienvenido, {user.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Estás dentro de <strong>Galaxium ERP</strong>
            </p>
          </>
        ) : (
          <p>No se pudo cargar el usuario</p>
        )}
      </main>
    </div>
  );
}
