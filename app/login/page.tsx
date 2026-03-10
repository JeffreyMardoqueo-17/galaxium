"use client";

import { useState } from "react";
import LoginErrorAlert from "@/components/features/auth/LoginErrorAlert";
import LoginForm from "@/components/features/auth/LoginForm";
import LoginHeader from "@/components/features/auth/LoginHeader";
import ForgotPasswordForm from "@/components/features/auth/ForgotPasswordForm";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginPage() {
  const [showForgot, setShowForgot] = useState(false);

  const {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {showForgot ? (
            <ForgotPasswordForm onBack={() => setShowForgot(false)} />
          ) : (
            <>
              <LoginHeader />

              {error && <LoginErrorAlert message={error} />}

              <LoginForm
                username={username}
                password={password}
                showPassword={showPassword}
                loading={loading}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onTogglePassword={() => setShowPassword((value) => !value)}
                onSubmit={handleSubmit}
              />

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-8 px-4">
          © 2024 Galaxium ERP. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
