// ===============================
// CREATE
// ===============================
export interface ProductCreateRequest {
  categoryId: number;
  name: string;
  costPrice: number;
  salePrice: number;
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
  costPrice: number;
  salePrice: number;
  stock: number;
  minimumStock: number;
  isActive: boolean;
  createdAt: string; // ISO string

  categoryId: number;
  categoryName: string | null;

  createdByUserId: number;
  createdByUserName: string;
}
