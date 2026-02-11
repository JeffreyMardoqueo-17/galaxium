"use client";

import React, { useEffect, useState } from "react";
import { HeroTable } from "@/components/ui/tables";
import { CreateCustomerModal } from "@/components/features/customer/CustomerFrom";
import {
  CustomerCreateRequestDTO,
  CustomerResponseDTO,
} from "@/types/custoner";
import { getAuthHeaders } from "@/utils/getAddHeaders";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";

/* ================= API ================= */

async function fetchCustomers(): Promise<CustomerResponseDTO[]> {
  const res = await fetch(`${API_URL}/Customer`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error al obtener clientes");

  const data = await res.json();

  // 🔥 Normalización por si backend manda PascalCase
  return data.map((c: any) => ({
    id: c.id ?? c.Id,
    fullName: c.fullName ?? c.FullName,
    phone: c.phone ?? c.Phone,
    email: c.email ?? c.Email,
    createdAt: c.createdAt ?? c.CreatedAt,
  }));
}

async function createCustomer(
  data: CustomerCreateRequestDTO
): Promise<CustomerResponseDTO> {
  const res = await fetch(`${API_URL}/Customer`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody?.message || "Error al crear cliente");
  }

  return res.json();
}

/* ================= PAGE ================= */

export default function CustomerPage() {
  const [customers, setCustomers] = useState<CustomerResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCustomer(
    customer: CustomerCreateRequestDTO
  ) {
    await createCustomer(customer);
    await loadCustomers();
  }

  /* ================= RENDER ================= */

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Clientes</h1>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Nuevo Cliente
        </button>
      </header>

      {/* STATES */}
      {loading && <p>Cargando clientes...</p>}
      {error && (
        <p className="text-red-600 font-medium">Error: {error}</p>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <HeroTable<CustomerResponseDTO>
          data={customers}
          columns={[
            {
              key: "fullName",
              label: "Nombre Completo",
            },
            {
              key: "phone",
              label: "Teléfono",
              render: (item) =>
                item.phone || (
                  <span className="text-gray-400">—</span>
                ),
            },
            {
              key: "email",
              label: "Correo",
              render: (item) =>
                item.email || (
                  <span className="text-gray-400">—</span>
                ),
            },
            {
              key: "createdAt",
              label: "Fecha Registro",
              render: (item) =>
                new Date(item.createdAt).toLocaleDateString(),
            },
          ]}
          page={page}
          pageSize={pageSize}
          totalItems={customers.length}
          onPageChange={setPage}
          actions={(item) => (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() =>
                  alert(`Ver cliente: ${item.fullName}`)
                }
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ver
              </button>

              <button
                onClick={() =>
                  alert(`Editar cliente: ${item.fullName}`)
                }
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Editar
              </button>

              <button
                onClick={() =>
                  alert(`Eliminar cliente: ${item.fullName}`)
                }
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          )}
        />
      )}

      {/* MODAL */}
      <CreateCustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCustomerCreate={handleCreateCustomer}
      />
    </div>
  );
}
