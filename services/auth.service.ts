import { AuthResponse, UserLoginRequest } from "@/types/auth";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

const API_BASE_URL = () => getApiBaseUrl();
const LOGIN_TIMEOUT_MS = 10000;

export class AuthServiceError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthServiceError";
    this.status = status;
  }
}

export async function login(data: UserLoginRequest): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOGIN_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL()}/User/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = "No se pudo iniciar sesión";

      try {
        const body = await res.json();
        if (typeof body?.message === "string" && body.message.trim()) {
          message = body.message;
        }
      } catch {
        // Si el backend no responde JSON válido, devolvemos mensaje genérico.
      }

      throw new AuthServiceError(message, res.status);
    }

    return (await res.json()) as AuthResponse;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AuthServiceError("La solicitud tardó demasiado", 408);
    }

    throw new AuthServiceError("No hay conexión con el servidor");
  } finally {
    clearTimeout(timeoutId);
  }
}

export function logout() {
  return fetch(`${API_BASE_URL()}/User/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function refreshSession() {
  const res = await fetch(`${API_BASE_URL()}/User/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new AuthServiceError("No se pudo refrescar la sesión", res.status);
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL()}/User/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new AuthServiceError("Error al solicitar el código", res.status);
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL()}/User/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, newPassword }),
  });
  if (!res.ok) {
    let message = "El código es inválido o ya expiró.";
    try {
      const body = await res.json();
      if (typeof body?.message === "string" && body.message.trim()) message = body.message;
    } catch { /* ignorar */ }
    throw new AuthServiceError(message, res.status);
  }
}