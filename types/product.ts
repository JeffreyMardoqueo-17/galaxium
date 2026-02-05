// ===============================
// CREATE
// ===============================
export interface ProductCreateRequest {
  categoryId: number;
  name: string;
  costPrice: number | null;
  salePrice: number | null;
  initialStock: number;
  minimumStock: number;
  isActive: boolean;
}

// ===============================
// UPDATE
// ===============================
export interface ProductUpdateRequest {
  categoryId: number;
  name: string;
  salePrice: number;
  minimumStock: number;
  isActive: boolean;
}

// ===============================
// RESPONSE
// ===============================
export interface ProductResponse {
  id: number;
  name: string;
  sku: string;
  costPrice: number | null;
  salePrice: number | null;
  stock: number | null;
  minimumStock: number;
  isActive: boolean;
  createdAt: string; // ISO string

  categoryId: number;
  categoryName: string | null;

  createdByUserId: number;
  createdByUserName: string;
}

// ===============================
// FILTER (REQUEST)
// ===============================
export interface ProductFilterRequest {
  categoryId?: number;
  name?: string;

  minPrice?: number;
  maxPrice?: number;

  minStock?: number;
  maxStock?: number;

  isActive?: boolean;

  orderBy?: string;
  orderDescending?: boolean;

  page?: number;
  pageSize?: number;
}
