// C:\Users\Admin\Documents\Projects\Proyectos\galaxium\services\sale.service.ts

import {
  SaleCreateDto,
  SaleResponseDto,
} from "../types/sale";

import { getAuthHeaders } from "../utils/getAddHeaders";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";
const BASE_URL = `${API_URL}/Sale`;

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
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
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
  const response = await fetch(`${BASE_URL}/${saleId}`, {
    method: "GET",
    headers: getAuthHeaders(),
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
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
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
    `${BASE_URL}/ByDateRange?start=${start}&end=${end}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
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
    `${BASE_URL}/ByCustomer/${customerId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}
