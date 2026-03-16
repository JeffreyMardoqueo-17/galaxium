import { headers } from "next/headers";

const DEFAULT_API_PORT = process.env.NEXT_PUBLIC_API_PORT ?? "5213";
const DEFAULT_API_BASE_URL = `http://localhost:${DEFAULT_API_PORT}/api`;

export async function getServerApiBaseUrl() {
  const configuredBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();

  try {
    const requestHeaders = await headers();
    const hostHeader = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    const protocolHeader = requestHeaders.get("x-forwarded-proto") ?? "http";

    if (!hostHeader) {
      return (configuredBaseUrl || DEFAULT_API_BASE_URL).replace(/\/$/, "");
    }

    if (!configuredBaseUrl) {
      const host = hostHeader.split(":")[0];
      return `${protocolHeader}://${host}:${DEFAULT_API_PORT}/api`;
    }

    const configuredUrl = new URL(configuredBaseUrl);
    const requestHost = hostHeader.split(":")[0];

    if (configuredUrl.hostname !== requestHost) {
      configuredUrl.hostname = requestHost;
    }

    return configuredUrl.toString().replace(/\/$/, "");
  } catch {
    return (configuredBaseUrl || DEFAULT_API_BASE_URL).replace(/\/$/, "");
  }
}
