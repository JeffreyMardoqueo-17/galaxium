import { cookies } from "next/headers";
import { CategoryRead } from "@/types/category";
import { CustomerResponseDTO } from "@/types/custoner";
import { PaymentMethodResponse } from "@/types/PaymentMethod";
import { ProductResponse } from "@/types/product";
import { getServerApiBaseUrl } from "@/lib/getServerApiBaseUrl";

async function fetchWithAuth<T>(path: string): Promise<T> {
  const apiBaseUrl = await getServerApiBaseUrl();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || "No se pudieron cargar los datos de venta");
  }

  return (await response.json()) as T;
}

export type SalePageData = {
  products: ProductResponse[];
  customers: CustomerResponseDTO[];
  paymentMethods: PaymentMethodResponse[];
  categories: CategoryRead[];
};

export async function getSalePageData(): Promise<SalePageData> {
  const [products, customers, paymentMethods, categories] = await Promise.all([
    fetchWithAuth<ProductResponse[]>("/Product/filter?isActive=true&pageSize=1000"),
    fetchWithAuth<CustomerResponseDTO[]>("/Customer"),
    fetchWithAuth<PaymentMethodResponse[]>("/PaymentMethod"),
    fetchWithAuth<CategoryRead[]>("/ProductCategory"),
  ]);

  return {
    products: products || [],
    customers: customers || [],
    paymentMethods: paymentMethods || [],
    categories: categories || [],
  };
}

export async function getSalePageDataSafe(): Promise<{
  data: SalePageData | null;
  error: string | null;
}> {
  try {
    const data = await getSalePageData();
    return { data, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron cargar los datos de venta.";
    return { data: null, error: message };
  }
}
