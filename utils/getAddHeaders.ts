export const UNAUTHORIZED_ERROR = "UNAUTHORIZED";

export function isUnauthorizedError(error: unknown) {
  return error instanceof Error && error.message === UNAUTHORIZED_ERROR;
}

export function handleUnauthorizedClient() {
  // La navegación por sesión expirada se centraliza en el layout protegido
  // para permitir primero el intento de refresh por cookie.
}

export function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
  };
}