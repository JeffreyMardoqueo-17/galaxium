
// ===============================
// TYPES
// ===============================
import {
  DashboardSalesAnalytics,
  DashboardSummary,
  TopSellingProductsResponse,
} from "@/types/dasboard";

import { getAuthHeaders } from "@/utils/getAddHeaders";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

// ===============================
// API URL
// ===============================
const API_URL = () => getApiBaseUrl();

function buildApiError(
  errorBody: { message?: string; error?: string } | null,
  fallback: string
) {
  const baseMessage = errorBody?.message || fallback;
  const technicalDetail = errorBody?.error;

  return technicalDetail
    ? `${baseMessage} (${technicalDetail})`
    : baseMessage;
}

// ===============================
// SERVICE
// ===============================
export const dashboardService = {
  // ============================================================
  // SUMMARY
  // GET: /api/dashboard/summary
  // ============================================================
  async getSummary(): Promise<DashboardSummary> {
    const res = await fetch(
      `${API_URL()}/dashboard/summary`,
      {
        method: "GET",
        headers: getAuthHeaders(),
    credentials: 'include', // ✅ sin duplicar headers
      }
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw new Error(buildApiError(errorBody, "Error al obtener el resumen del dashboard"));
    }

    return await res.json();
  },

  // ============================================================
  // TOP PRODUCTS
  // GET: /api/dashboard/top-products?top=5
  // ============================================================
  async getTopSellingProducts(
    top: number = 5
  ): Promise<TopSellingProductsResponse> {
    const res = await fetch(
      `${API_URL()}/dashboard/top-products?top=${top}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
    credentials: 'include', // ✅ limpio
      }
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw new Error(buildApiError(errorBody, "Error al obtener los productos mas vendidos"));
    }

    return await res.json();
  },

  async getSalesAnalytics(
    days: number = 14,
    months: number = 12,
    years: number = 5
  ): Promise<DashboardSalesAnalytics> {
    const res = await fetch(
      `${API_URL()}/dashboard/sales-analytics?days=${days}&months=${months}&years=${years}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw new Error(buildApiError(errorBody, "Error al obtener la analitica de ventas"));
    }

    return await res.json();
  },
};