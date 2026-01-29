"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const result = await login({ username, password });

    // aqui fuardo el  tokens
    localStorage.setItem("access_token", result.accessToken);
    localStorage.setItem("user", JSON.stringify(result.user));

    // cookie SOLO para middlewarea
    document.cookie = `access_token=1; path=/`;

    router.push("/");
  } catch {
    setError("Usuario o contraseña incorrectos");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
      >
        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          Galaxium ERP
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Usuario"
          className="mb-3 w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="mb-4 w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
