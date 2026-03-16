const DEFAULT_API_PORT = process.env.NEXT_PUBLIC_API_PORT ?? "5213";
const DEFAULT_API_BASE_URL = `http://localhost:${DEFAULT_API_PORT}/api`;

export function getApiBaseUrl() {
  const configuredBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();

  if (typeof window === "undefined") {
    return (configuredBaseUrl || DEFAULT_API_BASE_URL).replace(/\/$/, "");
  }

  const browserHost = window.location.hostname;

  if (!configuredBaseUrl) {
    return `${window.location.protocol}//${browserHost}:${DEFAULT_API_PORT}/api`;
  }

  try {
    const configuredUrl = new URL(configuredBaseUrl);

    // Mantener la API en el mismo host que el frontend evita pérdida de cookies
    // cuando se alterna entre localhost y una IP LAN.
    if (configuredUrl.hostname !== browserHost) {
      configuredUrl.hostname = browserHost;
    }

    return configuredUrl.toString().replace(/\/$/, "");
  } catch {
    if (configuredBaseUrl.startsWith("/")) {
      return `${window.location.origin}${configuredBaseUrl}`.replace(/\/$/, "");
    }

    return configuredBaseUrl.replace(/\/$/, "");
  }
}