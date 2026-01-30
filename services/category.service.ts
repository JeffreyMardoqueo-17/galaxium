import { CategoryRead, CategoryRequest } from "@/types/category";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No autenticado");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getCategories(): Promise<CategoryRead[]> {
  const res = await fetch(`${API_URL}/ProductCategory`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener categorías");
    }
    console.log("Respuesta de getCategories:", res);
  return res.json();
}

export async function getCategoriesById(id: number): Promise<CategoryRead> {
  const res = await fetch(`${API_URL}/ProductCategory/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener categoría");
  }

  return res.json();
}

export async function createCategory(data: CategoryRequest): Promise<CategoryRead> {
  const res = await fetch(`${API_URL}/ProductCategory`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error al crear categoría");
  }

  return res.json();
}
