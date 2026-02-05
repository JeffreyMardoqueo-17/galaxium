import {
  StockEntryCreate,
  StockEntryResponse,
} from "@/types/StockEntry";
import { getAuthHeaders } from "@/utils/getAddHeaders";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";

// ===============================
// GET ALL STOCK ENTRIES
// ===============================
export async function getStockEntries(): Promise<StockEntryResponse[]> {
  const res = await fetch(`${API_URL}/StockEntry`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener entradas de stock");
  }

  return res.json();
}

// ===============================
// GET STOCK ENTRY BY ID
// ===============================
export async function getStockEntryById(
  id: number
): Promise<StockEntryResponse> {
  const res = await fetch(`${API_URL}/StockEntry/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener la entrada de stock");
  }

  return res.json();
}

// ===============================
// CREATE STOCK ENTRY
// ===============================
export async function createStockEntry(
  data: StockEntryCreate
): Promise<StockEntryResponse> {
  const res = await fetch(`${API_URL}/StockEntry`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // Intentar obtener detalles del error del backend
    let errorMessage = "Error al crear la entrada de stock";
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors) {
        // Errores de validación de ModelState
        const errors = Object.values(errorData.errors).flat();
        errorMessage = errors.join(", ");
      } else if (errorData.title) {
        errorMessage = errorData.title;
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar mensaje por defecto
      errorMessage = `Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
