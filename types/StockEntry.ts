// ===============================
// ENUM - DEBE COINCIDIR CON BACKEND
// ===============================
export enum StockReferenceType {
  Purchase = 1,     // Compra (entra stock)
  Sale = 2,         // Venta (sale stock)
  Adjustment = 3    // Ajuste/Corrección manual
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
  createdAt: string; // ISO string
}

