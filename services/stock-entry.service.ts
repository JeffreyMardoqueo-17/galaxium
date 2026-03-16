import {
  StockEntryCreate,
  StockEntryResponse,
} from "@/types/StockEntry";
import {
  getAuthHeaders,
  handleUnauthorizedClient,
  UNAUTHORIZED_ERROR,
} from "@/utils/getAddHeaders";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

const API_URL = () => getApiBaseUrl();

// ===============================
// GET ALL STOCK ENTRIES
// ===============================
export async function getStockEntries(): Promise<StockEntryResponse[]> {
  const res = await fetch(`${API_URL()}/StockEntry`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorizedClient();
      throw new Error(UNAUTHORIZED_ERROR);
    }

    const errorText = await res.text().catch(() => "");
    throw new Error(errorText?.trim() || `Error al obtener entradas de stock (HTTP ${res.status})`);
  }

  return res.json();
}

// ===============================
// GET STOCK ENTRY BY ID
// ===============================
export async function getStockEntryById(
  id: number
): Promise<StockEntryResponse> {
  const res = await fetch(`${API_URL()}/StockEntry/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorizedClient();
      throw new Error(UNAUTHORIZED_ERROR);
    }

    const errorText = await res.text().catch(() => "");
    throw new Error(errorText?.trim() || `Error al obtener la entrada de stock (HTTP ${res.status})`);
  }

  return res.json();
}

// ===============================
// CREATE STOCK ENTRY
// ===============================
export async function createStockEntry(
  data: StockEntryCreate
): Promise<StockEntryResponse> {
  const res = await fetch(`${API_URL()}/StockEntry`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorizedClient();
      throw new Error(UNAUTHORIZED_ERROR);
    }

    // Intentar obtener detalles del error del backend
    let errorMessage = "Error al crear la entrada de stock";
    try {
      const errorData = await res.json();
      console.log("❌ Error del backend:", errorData); // Para debugging
      
      // Intentar extraer el mensaje del error de diferentes formatos
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.title) {
        errorMessage = errorData.title;
      } else if (errorData.errors) {
        // Errores de validación de ModelState
        const errors = Object.values(errorData.errors).flat();
        errorMessage = errors.join(", ");
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar mensaje por defecto
      console.error("❌ No se pudo parsear error:", e);
      errorMessage = `Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
