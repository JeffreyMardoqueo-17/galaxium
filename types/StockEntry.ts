// ===============================
// ENUM - DEBE COINCIDIR CON BACKEND
// ===============================
export enum StockReferenceType {
  Purchase = 1,     // Compra (entra stock)
  Sale = 2,         // Venta (sale stock)
  Adjustment = 3,   // Ajuste/Corrección manual
  Return = 4        // Devolución
}

// ===============================
// CREATE REQUEST
// ===============================
export interface StockEntryCreate {
  productId: number;
  quantity: number;
  unitCost: number; // decimal en backend
  referenceType: StockReferenceType;
  referenceId?: number;
  reason?: string;
  supplierId?: number;
}

// ===============================
// RESPONSE
// ===============================
export interface StockEntryResponse {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceType: string; // Backend devuelve "Purchase", "Sale", "Adjustment"
  referenceId?: number;
  reason?: string | null;
  supplierId?: number | null;
  supplierName?: string | null;
  createdAt: string; // ISO string
}

