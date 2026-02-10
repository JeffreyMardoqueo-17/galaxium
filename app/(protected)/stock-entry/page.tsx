"use client";

import { useEffect, useState } from "react";
import { HeroTable } from "@/components/ui/tables";
import { CreateStockEntryModal } from "@/components/features/stockEntry/StockEntryForm";
import { StockEntryDetailModal } from "@/components/features/stockEntry/StockEntryVerMas";
import { showToast } from "@/components/ui/modales/Toast";
import {
  StockEntryCreate,
  StockEntryResponse,
  StockReferenceType,
} from "@/types/StockEntry";
import {
  getStockEntries,
  createStockEntry,
} from "@/services/stock-entry.service";
import { getProducts, getAllProducts } from "@/services/product.service";
import type { ProductResponse } from "@/types/product";
import { IoIosCreate } from "react-icons/io";
import { formatDate } from "@/utils/formatDate";


// Helper para mostrar tipos en español
function getReferenceTypeLabel(type: string): string {
  switch (type) {
    case "Purchase":
      return "Compra";
    case "Sale":
      return "Venta";
    case "Adjustment":
      return "Ajuste";
    default:
      return type || "Desconocido";
  }
}

// Helper para colores de badge
function getReferenceTypeColor(type: string): string {
  switch (type) {
    case "Purchase":
      return "bg-green-100 text-green-700";
    case "Sale":
      return "bg-red-100 text-red-700";
    case "Adjustment":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function StockEntryPage() {
  // ===============================
  // STATE
  // ===============================
  const [stockEntries, setStockEntries] = useState<StockEntryResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);

  const [loadingStockEntries, setLoadingStockEntries] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<StockEntryResponse | null>(null);

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
  });
  // LOAD STOCK ENTRIES
  // ===============================
  async function loadStockEntries() {
    setLoadingStockEntries(true);
    try {
      const data = await getStockEntries();
      setStockEntries(data);
    } catch (error: any) {
      console.error("Error cargando entradas de stock", error);
      showToast({
        title: "Error al cargar",
        description: error.message || "No se pudieron cargar las entradas de stock",
        color: "danger",
      });
    } finally {
      setLoadingStockEntries(false);
    }
  }

  // ===============================
  // LOAD PRODUCTS
  // ===============================
  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error: any) {
      console.error("Error cargando productos", error);
      showToast({
        title: "Error al cargar",
        description: error.message || "No se pudieron cargar los productos",
        color: "danger",
      });
    } finally {
      setLoadingProducts(false);
    }
  }

  // ===============================
  // EFFECTS
  // ===============================
  useEffect(() => {
    loadProducts();
    loadStockEntries();
  }, []);

  // ===============================
  // CREATE STOCK ENTRY
  // ===============================
async function handleStockEntryCreate(stockEntry: StockEntryCreate) {
  console.log("🚀 Intentando crear entrada de stock...", stockEntry);
  try {
    const result = await createStockEntry(stockEntry);
    console.log("✅ Entrada creada exitosamente:", result);

    // ✅ SUCCESS
    showToast({
      title: "Entrada registrada",
      description: "La entrada fue creada correctamente",
      color: "success",
    });

    setModalOpen(false);
    await loadStockEntries();
    await loadProducts();

  } catch (error: any) {
    console.error("❌ Error del backend:", error);

    // 🔴 MENSAJE DEL BACKEND
    showToast({
      title: "Movimiento rechazado",
      description:
        error.message ||
        "No se pudo registrar la entrada",
      color: "danger",
    });

    // 👇 CLAVE → evita que el modal se cierre
    throw error;
  }
}


  // ===============================
  // OPEN DETAIL MODAL
  // ===============================
  function handleViewDetails(entry: StockEntryResponse) {
    setSelectedEntry(entry);
    setDetailModalOpen(true);
  }

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="space-y-6 p-2 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Entradas de Stock</h1>
        <div className="flex gap-2">
          {/* 🧪 Botón de prueba de Toast */}
          <button
            onClick={() => {
              console.log("🧪 Probando toast...");
              showToast({
                title: "Prueba de Toast",
                description: "Si ves esto, el toast funciona correctamente",
                color: "success",
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            🧪 Probar Toast
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-md cursor-pointer hover:bg-green-700"
          >
            <IoIosCreate size={20} />
            Nueva Entrada
          </button>
        </div>
      </div>

      {/* LOADING VISUAL */}
      {loadingStockEntries && (
        <p className="text-sm text-gray-500">Cargando entradas de stock...</p>
      )}

      {/* TABLE */}
      <HeroTable
        data={stockEntries}
        columns={[
          {
            key: "productName",
            label: "Producto",
            align: "start",
          },
          {
            key: "quantity",
            label: "Cantidad",
            align: "end",
            render: (item: StockEntryResponse) => (
              <span className="font-semibold text-green-700">
                +{item.quantity}
              </span>
            ),
          },
          {
            key: "unitCost",
            label: "Costo Unit.",
            align: "end",
            render: (item: StockEntryResponse) => `$${item.unitCost.toFixed(2)}`,
          },
          {
            key: "totalCost",
            label: "Costo Total",
            align: "end",
            render: (item: StockEntryResponse) => (
              <span className="font-bold text-gray-900">
                ${item.totalCost.toFixed(2)}
              </span>
            ),
          },
          {
            key: "referenceType",
            label: "Tipo Mov.",
            align: "center",
            render: (item: StockEntryResponse) => (
              <span 
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getReferenceTypeColor(item.referenceType)}`}
              >
                {getReferenceTypeLabel(item.referenceType)}
              </span>
            ),
          },
          {
            key: "userName",
            label: "Registrado por",
          },
          {
            key: "createdAt",
            label: "Fecha",
            render: (item: StockEntryResponse) => formatDate(item.createdAt),
          },
        ]}
        actions={(item) => (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleViewDetails(item)}
              className="bg-blue-500 px-3 py-1 text-white rounded-md hover:bg-blue-600"
            >
              Ver
            </button>
          </div>
        )}
        page={filters.page}
        pageSize={filters.pageSize}
        totalItems={stockEntries.length}
        onPageChange={(page) =>
          setFilters((f) => ({
            ...f,
            page,
          }))
        }
      />

      {modalOpen && (
        <CreateStockEntryModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          products={products}
          onStockEntryCreate={handleStockEntryCreate}
        />
      )}

      {detailModalOpen && (
        <StockEntryDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          stockEntry={selectedEntry}
        />
      )}
    </div>
  );
}

