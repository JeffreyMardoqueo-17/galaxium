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
  totalRevenue?: number;
  revenueGenerated?: number;
}

// ===============================
// TOP SELLING PRODUCTS RESPONSE
// ===============================
export interface TopSellingProductsResponse {
  requestedTop: number;
  products: TopSellingProduct[];
}

export interface DashboardSalesPoint {
  label: string;
  totalAmount: number;
  totalTransactions: number;
}

export interface DashboardSalesAnalytics {
  todayRevenue: number;
  currentMonthRevenue: number;
  currentYearRevenue: number;
  bestSalesWeekday: string;
  bestSalesWeekdayRevenue: number;
  bestSalesWeekdayTransactions: number;
  dailySeries: DashboardSalesPoint[];
  monthlySeries: DashboardSalesPoint[];
  yearlySeries: DashboardSalesPoint[];
}
