export interface PurchaseDetailCreateRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseCreateRequest {
  supplierId: number;
  details: PurchaseDetailCreateRequest[];
}

export interface PurchaseDetailResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseResponse {
  id: number;
  supplierId: number;
  supplierName: string;
  userId: number;
  purchaseDate: string;
  total: number;
  status: string;
  details: PurchaseDetailResponse[];
}
