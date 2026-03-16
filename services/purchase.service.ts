import { getApiBaseUrl } from "@/lib/getApiBaseUrl";
import { getAuthHeaders, UNAUTHORIZED_ERROR } from "@/utils/getAddHeaders";
import { PurchaseCreateRequest, PurchaseResponse } from "@/types/purchase";

const API_URL = () => `${getApiBaseUrl()}/Purchase`;

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = (await res.json()) as { message?: string };
      if (payload.message) {
        return payload.message;
      }
    }

    const text = (await res.text()).trim();
    if (text) {
      return text;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export async function getPurchases(startDate?: string, endDate?: string): Promise<PurchaseResponse[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const url = `${API_URL()}${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_ERROR);
    }

    throw new Error(await readErrorMessage(res, "No se pudo cargar compras"));
  }

  return res.json();
}

export async function createPurchase(payload: PurchaseCreateRequest): Promise<PurchaseResponse> {
  const res = await fetch(API_URL(), {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_ERROR);
    }

    throw new Error(await readErrorMessage(res, "No se pudo registrar compra"));
  }

  return res.json();
}
