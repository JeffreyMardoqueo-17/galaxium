
// ===============================
// TYPES
// ===============================
import {
  DashboardSummary,
  TopSellingProductsResponse,
} from "@/types/dasboard";

import { getAuthHeaders } from "@/utils/getAddHeaders";

// ===============================
// API URL
// ===============================
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5213/api";

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
      `${API_URL}/dashboard/summary`,
      {
        method: "GET",
        headers: getAuthHeaders(), // ✅ sin duplicar headers
      }
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw new Error(
        errorBody?.message ||
          "Error al obtener el resumen del dashboard"
      );
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
      `${API_URL}/dashboard/top-products?top=${top}`,
      {
        method: "GET",
        headers: getAuthHeaders(), // ✅ limpio
      }
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);

      throw new Error(
        errorBody?.message ||
          "Error al obtener los productos más vendidos"
      );
    }

    return await res.json();
  },
};