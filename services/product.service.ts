import {
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductResponse,
  ProductFilterRequest,
  ProductUpdatePriceRequest,
  ProductWithPhotosResponse,
} from "@/types/product";
import { getAuthHeaders, handleUnauthorizedClient, UNAUTHORIZED_ERROR } from "@/utils/getAddHeaders";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

const API_URL = () => getApiBaseUrl();



// ===============================
// GET ALL PRODUCTS (ACTIVE ONLY)
// ===============================
export async function getProducts(): Promise<ProductResponse[]> {
  return getProductsByFilter({ isActive: true, pageSize: 1000 });
}

// ===============================
// GET ALL PRODUCTS (ACTIVE + INACTIVE)
// ===============================
export async function getAllProducts(): Promise<ProductResponse[]> {
  return getProductsByFilter({ pageSize: 1000 });
}

// ===============================
// GET PRODUCT BY ID
// ===============================
export async function getProductById(id: number): Promise<ProductResponse> {
  const res = await fetch(`${API_URL()}/Product/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorizedClient();
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw new Error("Error al obtener el producto");
  }

  return res.json();
}

// ===============================
// CREATE PRODUCT
// ===============================
export async function createProduct(
  data: ProductCreateRequest,
): Promise<ProductResponse> {
  const res = await fetch(`${API_URL()}/Product`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorizedClient();
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw new Error("Error al crear el producto");
  }

  return res.json();
}

// ===============================
// UPDATE PRODUCT (cuando el backend lo tenga)
// ===============================
export async function updateProduct(
  id: number,
  data: ProductUpdateRequest,
): Promise<ProductResponse> {
  const res = await fetch(`${API_URL()}/Product/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorizedClient();
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw new Error("Error al actualizar el producto");
  }

  return res.json();
}

// ===============================
// GET PRODUCTS BY FILTER
 // ===============================
        // GET: api/product/filter
        // GET /api/product/filter?
        // categoryId=2
        // &minPrice=50
        // &maxPrice=200
        // &minStock=10
        // &maxStock=20
        // &orderBy=SalePrice
        // &orderDescending=false
        // &page=1
        // &pageSize=20
// ===============================
export async function getProductsByFilter(
  filter: ProductFilterRequest,
): Promise<ProductResponse[]> {
  const queryParams = new URLSearchParams();

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const url = `${API_URL()}/Product/filter?${queryParams.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    const message =
      errorText?.trim() ||
      `Error al obtener productos filtrados (HTTP ${res.status})`;
    if (res.status === 401) {
      handleUnauthorizedClient();
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw new Error(message);
  }

  return res.json();
}

// ===============================
// UPDATE PRODUCT PRICE
// ===============================
export async function updateProductPrice(
  data: ProductUpdatePriceRequest,
): Promise<ProductResponse> {
  const res = await fetch(`${API_URL()}/Product/price`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) {
      handleUnauthorizedClient();
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw new Error(errorText || "Error al actualizar el precio del producto");
  }

  return res.json();
}

export async function getProductsWithPhotos(): Promise<ProductWithPhotosResponse[]> {
  const res = await fetch(`${API_URL()}/Product/with-photos`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorizedClient();
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw new Error("Error al obtener productos con fotos");
  }

  return res.json();
}