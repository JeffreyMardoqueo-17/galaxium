const DEFAULT_API_BASE_URL = "http://localhost:5213/api";

export function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;

  if (typeof window === "undefined") {
    return configuredBaseUrl;
  }

  try {
    const configuredUrl = new URL(configuredBaseUrl);
    const browserHost = window.location.hostname;

    if (configuredUrl.hostname !== browserHost) {
      configuredUrl.hostname = browserHost;
    }

    return configuredUrl.toString().replace(/\/$/, "");
  } catch {
    return configuredBaseUrl;
  }
}