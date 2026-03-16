"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthServiceError, login } from "@/services/auth.service";

export function useLoginForm() {
  const router = useRouter();
  const inFlightRef = useRef(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inFlightRef.current) {
      return;
    }

    setError(null);
    setLoading(true);
    inFlightRef.current = true;

    try {
      await login({ username: username.trim(), password });
      router.replace("/");
      router.refresh();
    } catch (err) {
      if (err instanceof AuthServiceError) {
        if (err.status === 400 || err.status === 401) {
          setError("Usuario o contraseña incorrectos");
        } else if (err.status === 408) {
          setError("La API tardó demasiado en responder");
        } else {
          setError(err.message || "No se pudo iniciar sesión");
        }
      } else {
        setError("No se pudo iniciar sesión");
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    handleSubmit,
  };
}