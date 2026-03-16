export interface SalesByDayItem {
  date: string;
  transactions: number;
  totalAmount: number;
}

export interface SalesByProductItem {
  productId: number;
  productName: string;
  quantitySold: number;
  totalAmount: number;
}

export interface SalesByCategoryItem {
  categoryId: number;
  categoryName: string;
  quantitySold: number;
  totalAmount: number;
}

export interface ProfitSummary {
  revenue: number;
  investment: number;
  profit: number;
}

export interface InventorySnapshotItem {
  productId: number;
  productName: string;
  sku: string;
  stock: number;
  minimumStock: number;
  isLowStock: boolean;
  isExhausted: boolean;
}

export interface PurchaseHistoryItem {
  purchaseId: number;
  purchaseDate: string;
  supplierId: number;
  supplierName: string;
  total: number;
  lines: number;
}

export interface StockAlert {
  id: number;
  productId: number;
  product: { id: number; name: string };
  alertType: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  resolvedAt?: string | null;
}
