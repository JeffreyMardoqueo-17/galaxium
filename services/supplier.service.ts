import { getApiBaseUrl } from "@/lib/getApiBaseUrl";
import { getAuthHeaders, UNAUTHORIZED_ERROR } from "@/utils/getAddHeaders";
import { SupplierCreateRequest, SupplierResponse, SupplierUpdateRequest } from "@/types/supplier";

const API_URL = () => `${getApiBaseUrl()}/Supplier`;

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

export async function getSuppliers(): Promise<SupplierResponse[]> {
  const res = await fetch(API_URL(), {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_ERROR);
    }

    throw new Error(await readErrorMessage(res, "No se pudo cargar proveedores"));
  }

  return res.json();
}

export async function createSupplier(payload: SupplierCreateRequest): Promise<SupplierResponse> {
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

    throw new Error(await readErrorMessage(res, "No se pudo crear proveedor"));
  }

  return res.json();
}

export async function updateSupplier(supplierId: number, payload: SupplierUpdateRequest): Promise<SupplierResponse> {
  const res = await fetch(`${API_URL()}/${supplierId}`, {
    method: "PUT",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_ERROR);
    }

    throw new Error(await readErrorMessage(res, "No se pudo actualizar proveedor"));
  }

  return res.json();
}
