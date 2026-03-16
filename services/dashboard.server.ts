import { cookies } from "next/headers";
import {
  DashboardSalesAnalytics,
  DashboardSummary,
  TopSellingProductsResponse,
} from "@/types/dasboard";
import { getServerApiBaseUrl } from "@/lib/getServerApiBaseUrl";

async function fetchWithAuth<T>(path: string): Promise<T> {
  const apiBaseUrl = await getServerApiBaseUrl();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || "No se pudo cargar el dashboard");
  }

  return (await res.json()) as T;
}

export async function getDashboardData(top = 5): Promise<{
  summary: DashboardSummary;
  topProducts: TopSellingProductsResponse;
  salesAnalytics: DashboardSalesAnalytics;
}> {
  const [summary, topProducts, salesAnalytics] = await Promise.all([
    fetchWithAuth<DashboardSummary>("/dashboard/summary"),
    fetchWithAuth<TopSellingProductsResponse>(`/dashboard/top-products?top=${top}`),
    fetchWithAuth<DashboardSalesAnalytics>("/dashboard/sales-analytics?days=14&months=12&years=5"),
  ]);

  return { summary, topProducts, salesAnalytics };
}

export async function getDashboardDataSafe(top = 5): Promise<{
  data: {
    summary: DashboardSummary;
    topProducts: TopSellingProductsResponse;
    salesAnalytics: DashboardSalesAnalytics;
  } | null;
  error: string | null;
}> {
  try {
    const data = await getDashboardData(top);
    return { data, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar el dashboard.";
    return { data: null, error: message };
  }
}
