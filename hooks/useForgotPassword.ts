"use client";

import { FormEvent, useRef, useState } from "react";
import { forgotPassword, resetPassword } from "@/services/auth.service";

export type ForgotStep = "email" | "code" | "success";

export function useForgotPassword(onBack: () => void) {
  const [step, setStep] = useState<ForgotStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inFlightRef = useRef(false);

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setStep("code");
    } catch {
      setError("Ocurrió un error al enviar el código. Intenta nuevamente.");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (inFlightRef.current) return;

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    inFlightRef.current = true;
    setError("");
    setLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      setStep("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Código inválido o expirado.";
      setError(msg);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    handleRequestCode,
    handleResetPassword,
    onBack,
  };
}
