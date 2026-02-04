"use client";

import React, { useEffect, useState } from "react";
import { HeroTable } from "@/components/ui/tables";
import { StockEntryForm } from "@/components/features/stockEntry/StockEntryForm";
import {
  StockEntryCreate,
  StockEntryResponse,
} from "@/types/StockEntry";
import { getAuthHeaders } from "@/utils/getAddHeaders";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";

/* ===========================
   API CALLS
   =========================== */
async function fetchStockEntries(): Promise<StockEntryResponse[]> {
  const res = await fetch(`${API_URL}/StockEntry`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error al obtener entradas de stock");

  return res.json();
}

async function createStockEntry(
  data: StockEntryCreate
): Promise<StockEntryResponse> {
  const res = await fetch(`${API_URL}/StockEntry`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(
      errorBody?.message || "Error al crear entrada de stock"
    );
  }

  return res.json();
}

/* ===========================
   PAGE
   =========================== */
export default function StockPage() {
  const [stockEntries, setStockEntries] = useState<StockEntryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadStockEntries();
  }, []);

  async function loadStockEntries() {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchStockEntries();
      setStockEntries(data);
    } catch (err) {
      setError((err as Error).message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStockEntry(
    stockEntry: StockEntryCreate
  ) {
    await createStockEntry(stockEntry);
    await loadStockEntries();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Entradas de Stock
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Nueva Entrada
        </button>
      </header>

      {loading && <p>Cargando stock...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <HeroTable
          data={stockEntries}
          columns={[
            { key: "id", label: "ID", align: "start" },
            { key: "productName", label: "Producto" },
            { key: "quantity", label: "Cantidad" },
            {
              key: "unitCost",
              label: "Costo Unitario",
              render: (item) =>
                `$${item.unitCost.toFixed(2)}`,
            },
            {
              key: "totalCost",
              label: "Costo Total",
              render: (item) =>
                `$${item.totalCost.toFixed(2)}`,
            },
            { key: "userName", label: "Registrado por" },
            {
              key: "createdAt",
              label: "Fecha",
              render: (item) =>
                new Date(item.createdAt).toLocaleDateString(),
            },
            {
              key: "isActive",
              label: "Activo",
              render: (item) =>
                item.isActive ? "Sí" : "No",
            },
          ]}
          page={page}
          pageSize={pageSize}
          totalItems={stockEntries.length}
          onPageChange={setPage}
          actions={(item) => (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() =>
                  alert(`Ver entrada #${item.id}`)
                }
                className="cursor-pointer bg-blue-500 px-3 py-1 text-white rounded-md hover:bg-blue-600 transition"
              >
                Ver
              </button>
            </div>
          )}
        />
      )}

      <StockEntryForm
        open={modalOpen}
        onOpenChange={setModalOpen}
        onStockEntryCreate={handleCreateStockEntry}
      />
    </div>
  );
}
