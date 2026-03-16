import { headers } from "next/headers";

const DEFAULT_API_BASE_URL = "http://localhost:5213/api";

export async function getServerApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;

  try {
    const requestHeaders = await headers();
    const hostHeader = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

    if (!hostHeader) {
      return configuredBaseUrl;
    }

    const configuredUrl = new URL(configuredBaseUrl);
    configuredUrl.hostname = hostHeader.split(":")[0];

    return configuredUrl.toString().replace(/\/$/, "");
  } catch {
    return configuredBaseUrl;
  }
}
