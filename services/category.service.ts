import { CategoryRead, CategoryRequest } from "@/types/category";
import { getAuthHeaders } from "@/utils/getAddHeaders";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

const API_URL = () => getApiBaseUrl();

export async function getCategories(): Promise<CategoryRead[]> {
  const res = await fetch(`${API_URL()}/ProductCategory`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sesion expirada. Inicia sesion nuevamente.");
    }

    const errorText = await res.text().catch(() => "");
    throw new Error(errorText?.trim() || `Error al obtener categorias (HTTP ${res.status})`);
  }

  return res.json();
}

export async function getCategoriesById(id: number): Promise<CategoryRead> {
  const res = await fetch(`${API_URL()}/ProductCategory/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sesion expirada. Inicia sesion nuevamente.");
    }

    throw new Error("Error al obtener categoría");
  }

  return res.json();
}

export async function createCategory(data: CategoryRequest): Promise<CategoryRead> {
  const res = await fetch(`${API_URL()}/ProductCategory`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sesion expirada. Inicia sesion nuevamente.");
    }

    throw new Error("Error al crear categoría");
  }

  return res.json();
}
