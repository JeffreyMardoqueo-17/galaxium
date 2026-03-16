export interface SupplierResponse {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SupplierCreateRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SupplierUpdateRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
}
