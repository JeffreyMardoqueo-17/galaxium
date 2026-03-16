// C:\Users\Admin\Documents\Projects\Proyectos\galaxium\services\sale.service.ts

import {
  SaleCreateDto,
  SaleHistoryResponseDto,
  SaleResponseDto,
} from "../types/sale";

import { getAuthHeaders } from "../utils/getAddHeaders";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";


const BASE_URL = () => `${getApiBaseUrl()}/Sale`;

// ==========================================
// CREATE SALE
// ======================================================
        // POST: api/Sale
        // Crear una nueva venta con detalles
        // Ejemplo de JSON para probar:
        /*
        {
            "customerId": 1,
            "sellerUserId": 2,
            "paymentMethodId": 1,
            "discount": 5,
            "details": [
                { "productId": 1, "quantity": 2 },
                { "productId": 3, "quantity": 1 }
            ]
        }
        */
        // ======================================================
// POST: api/Sale
// ==========================================
export async function createSale(
  sale: SaleCreateDto
): Promise<SaleResponseDto> {
  const response = await fetch(BASE_URL(), {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(sale),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

// ==========================================
// GET BY ID
// GET: api/Sale/{saleId}
// ==========================================
export async function getSaleById(
  saleId: number
): Promise<SaleResponseDto> {
  const response = await fetch(`${BASE_URL()}/${saleId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

// ==========================================
// GET ALL SALES
// GET: api/Sale
// ==========================================
export async function getAllSales(): Promise<SaleResponseDto[]> {
  const response = await fetch(BASE_URL(), {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

// ==========================================
// GET BY DATE RANGE
// GET: api/Sale/ByDateRange?start=&end=
// ==========================================
export async function getSalesByDateRange(
  start: string,
  end: string
): Promise<SaleResponseDto[]> {
  const response = await fetch(
    `${BASE_URL()}/ByDateRange?start=${start}&end=${end}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

// ==========================================
// GET BY CUSTOMER
// GET: api/Sale/ByCustomer/{customerId}
// ==========================================
export async function getSalesByCustomer(
  customerId: number
): Promise<SaleResponseDto[]> {
  const response = await fetch(
    `${BASE_URL()}/ByCustomer/${customerId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function getSalesHistory(
  startDate?: string,
  endDate?: string
): Promise<SaleHistoryResponseDto> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const response = await fetch(
    `${BASE_URL()}/History${params.toString() ? `?${params.toString()}` : ""}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function downloadInvoicePdf(saleId: number): Promise<Blob> {
  const response = await fetch(`${BASE_URL()}/${saleId}/InvoicePdf`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.blob();
}

export async function downloadSalesReportPdf(
  startDate?: string,
  endDate?: string
): Promise<Blob> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const response = await fetch(
    `${BASE_URL()}/ReportPdf${params.toString() ? `?${params.toString()}` : ""}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.blob();
}

export async function downloadDailyInvoicesPdf(date: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL()}/DailyInvoicesPdf?date=${date}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.blob();
}
