// ===============================
// DASHBOARD SUMMARY
// ===============================
export interface DashboardSummary {
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  totalInvestment: number;
  totalStock: number;
  netProfit: number;
}

// ===============================
// TOP SELLING PRODUCT
// ===============================
export interface TopSellingProduct {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

// ===============================
// TOP SELLING PRODUCTS RESPONSE
// ===============================
export interface TopSellingProductsResponse {
  requestedTop: number;
  products: TopSellingProduct[];
}
