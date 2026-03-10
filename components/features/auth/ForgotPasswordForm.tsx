"use client";

import { Eye, EyeOff, ArrowLeft, Mail, KeyRound, CheckCircle } from "lucide-react";
import { useForgotPassword } from "@/hooks/useForgotPassword";

interface Props {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: Props) {
  const {
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
  } = useForgotPassword(onBack);

  if (step === "success") {
    return (
      <div className="text-center py-4 space-y-4">
        <CheckCircle className="mx-auto text-green-500" size={48} />
        <h3 className="text-lg font-semibold text-gray-800">
          ¡Contraseña actualizada!
        </h3>
        <p className="text-sm text-gray-500">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <button
          onClick={onBack}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Ir al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-gray-800">
          {step === "email" ? "Recuperar contraseña" : "Verificar código"}
        </h3>
        <p className="text-sm text-gray-500">
          {step === "email"
            ? "Ingresa tu correo y te enviaremos un código de verificación."
            : `Ingresamos un código de 6 dígitos a ${email}. Expira en 15 minutos.`}
        </p>
      </div>

      {/* Alerta de error */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Email */}
      {step === "email" && (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
              Usuario (correo electrónico)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="reset-email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-gray-50 disabled:text-gray-400"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white font-medium rounded-lg transition-colors text-sm"
          >
            {loading ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      )}

      {/* Step 2: Código + nueva contraseña */}
      {step === "code" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700">
              Código de verificación
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="reset-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                           tracking-widest text-center font-mono
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-gray-50"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-gray-50"
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:bg-gray-50"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6 || !newPassword || !confirmPassword}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white font-medium rounded-lg transition-colors text-sm"
          >
            {loading ? "Actualizando…" : "Cambiar contraseña"}
          </button>
        </form>
      )}

      {/* Volver al login */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mt-2"
      >
        <ArrowLeft size={14} />
        Volver al inicio de sesión
      </button>
    </div>
  );
}
