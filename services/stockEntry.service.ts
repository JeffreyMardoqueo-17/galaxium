import {
  StockEntryCreate,
  StockEntryResponse,
} from "@/types/StockEntry";
import { getAuthHeaders } from "@/utils/getAddHeaders";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";

/* ============================
   GET ALL
============================ */
export async function GetAllStockEntries(): Promise<StockEntryResponse[]> {
  const res = await fetch(`${API_URL}/StockEntry`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error al obtener entradas de stock");

  return res.json();
}

/* ============================
   GET BY ID
============================ */
export async function GetByIdStockEntry(
  id: number
): Promise<StockEntryResponse> {
  const res = await fetch(`${API_URL}/StockEntry/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error al obtener la entrada de stock");

  return res.json();
}

/* ============================
   CREATE
============================ */
export async function CreateStockEntry(
  data: StockEntryCreate
): Promise<StockEntryResponse> {
  const response = await fetch(`${API_URL}/StockEntry`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(
      errorBody.message || "Error al crear entrada de stock"
    );
  }

  return response.json();
}
