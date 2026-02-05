import {
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductResponse,
  ProductFilterRequest,
  ProductUpdatePriceRequest,
} from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No autenticado");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ===============================
// GET ALL PRODUCTS
// ===============================
export async function getProducts(): Promise<ProductResponse[]> {
  const res = await fetch(`${API_URL}/Product`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener productos");
  }

  return res.json();
}

// ===============================
// GET PRODUCT BY ID
// ===============================
export async function getProductById(
  id: number
): Promise<ProductResponse> {
  const res = await fetch(`${API_URL}/Product/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener el producto");
  }

  return res.json();
}

// ===============================
// CREATE PRODUCT
// ===============================
export async function createProduct(
  data: ProductCreateRequest
): Promise<ProductResponse> {
  const res = await fetch(`${API_URL}/Product`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error al crear el producto");
  }

  return res.json();
}

// ===============================
// UPDATE PRODUCT (cuando el backend lo tenga)
// ===============================
export async function updateProduct(
  id: number,
  data: ProductUpdateRequest
): Promise<ProductResponse> {
  const res = await fetch(`${API_URL}/Product/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error al actualizar el producto");
  }

  return res.json();
}

// ===============================
// GET PRODUCTS BY FILTER
// ===============================
export async function getProductsByFilter(
  filter: ProductFilterRequest
): Promise<ProductResponse[]> {
  const queryParams = new URLSearchParams();

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const url = `${API_URL}/Product/filter?${queryParams.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener productos filtrados");
  }

  return res.json();
}


// ===============================
// UPDATE PRODUCT PRICE
// ===============================
export async function updateProductPrice(
  data: ProductUpdatePriceRequest
): Promise<ProductResponse> {
  const res = await fetch(`${API_URL}/Product/price`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al actualizar el precio del producto");
  }

  return res.json();
}
