export interface StockEntryCreate {
  productId: number;
  quantity: number;
  unitCost: number; // decimal en backend
}

export interface StockEntryResponse {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  isActive: boolean;
  createdAt: string; // ISO string
}

export interface StockEntryUpdate {
  quantity?: number;
  unitCost?: number;
  isActive?: boolean;
}
