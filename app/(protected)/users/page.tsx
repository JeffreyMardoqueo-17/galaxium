"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/user.service";
import { UserResponse } from "@/types/user";

export default function Users() {


  return (
    <div className="flex  items-center justify-center font-sans">
      <main className="flex  w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <h1 className="text-3xl font-bold mb-4">Página de Usuarios</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aquí puedes gestionar todos los usuarios.
        </p>
      </main>
    </div>
  );
}
