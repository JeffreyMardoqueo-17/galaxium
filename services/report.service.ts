import { getApiBaseUrl } from "@/lib/getApiBaseUrl";
import { getAuthHeaders, UNAUTHORIZED_ERROR } from "@/utils/getAddHeaders";
import {
  InventorySnapshotItem,
  ProfitSummary,
  PurchaseHistoryItem,
  SalesByCategoryItem,
  SalesByDayItem,
  SalesByProductItem,
  StockAlert,
} from "@/types/report";

const API_URL = () => `${getApiBaseUrl()}/Report`;
const ALERT_URL = () => `${getApiBaseUrl()}/StockAlert`;

function buildRange(startDate?: string, endDate?: string): string {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  return params.toString() ? `?${params.toString()}` : "";
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = (await res.json()) as { message?: string; traceId?: string };
      if (payload.message && payload.traceId) {
        return `${payload.message} [${payload.traceId}]`;
      }

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

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_ERROR);
    }

    throw new Error(await readErrorMessage(res, `Request failed (${res.status})`));
  }

  return res.json();
}

export const reportService = {
  getSalesByDay: (startDate?: string, endDate?: string) =>
    getJson<SalesByDayItem[]>(`${API_URL()}/sales-by-day${buildRange(startDate, endDate)}`),

  getSalesByProduct: (startDate?: string, endDate?: string) =>
    getJson<SalesByProductItem[]>(`${API_URL()}/sales-by-product${buildRange(startDate, endDate)}`),

  getSalesByCategory: (startDate?: string, endDate?: string) =>
    getJson<SalesByCategoryItem[]>(`${API_URL()}/sales-by-category${buildRange(startDate, endDate)}`),

  getProfits: (startDate?: string, endDate?: string) =>
    getJson<ProfitSummary>(`${API_URL()}/profits${buildRange(startDate, endDate)}`),

  getInventory: () =>
    getJson<InventorySnapshotItem[]>(`${API_URL()}/inventory`),

  getPurchaseHistory: (startDate?: string, endDate?: string) =>
    getJson<PurchaseHistoryItem[]>(`${API_URL()}/purchase-history${buildRange(startDate, endDate)}`),

  getAlerts: () =>
    getJson<StockAlert[]>(`${ALERT_URL()}`),

  refreshAlerts: async () => {
    const res = await fetch(`${ALERT_URL()}/refresh`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error(UNAUTHORIZED_ERROR);
      }

      throw new Error(await readErrorMessage(res, "No se pudieron refrescar alertas"));
    }

    return res.json() as Promise<StockAlert[]>;
  },
};
