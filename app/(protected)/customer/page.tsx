"use client";

import React, { useEffect, useState } from "react";
import { HeroTable } from "@/components/ui/tables"; // solo importa el componente
import { CreateCustomerModal } from "@/components/features/customer/CustomerFrom"; // ajusta ruta si es necesario
import {
  CustomerCreateRequestDTO,
  CustomerResponseDTO,
} from "@/types/custoner";
import { getAuthHeaders } from "@/utils/getAddHeaders";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";

async function fetchCustomers(): Promise<CustomerResponseDTO[]> {
  const res = await fetch(`${API_URL}/Customer`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener clientes");
  return res.json();
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
  if (!res.ok) throw new Error("Error al crear cliente");
  return res.json();
}

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
      setError((err as Error).message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCustomer(customer: CustomerCreateRequestDTO) {
    try {
      await createCustomer(customer);
      await loadCustomers();
      setModalOpen(false);
    } catch (err) {
      alert(`No se pudo crear el cliente: ${(err as Error).message}`);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Nuevo Cliente
        </button>
      </header>

      {loading && <p>Cargando clientes...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <HeroTable
          data={customers}
          columns={[
            { key: "id", label: "ID", align: "start" },
            { key: "fullName", label: "Nombre Completo" },
            { key: "phone", label: "Teléfono" },
            { key: "email", label: "Correo Electrónico" },
            {
              key: "createdAt",
              label: "Fecha de Registro",
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
                onClick={() => alert(`Ver cliente: ${item.fullName}`)}
                className="cursor-pointer bg-blue-500 px-3 py-1 text-white rounded-md hover:bg-blue-600 transition"
              >
                Ver
              </button>
              <button
                onClick={() => alert(`Editar cliente: ${item.fullName}`)}
                className="cursor-pointer bg-yellow-500 px-3 py-1 text-white rounded-md hover:bg-yellow-600 transition"
              >
                Editar
              </button>
              <button
                onClick={() => alert(`Eliminar cliente: ${item.fullName}`)}
                className="cursor-pointer bg-red-500 px-3 py-1 text-white rounded-md hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </div>
          )}
        />
      )}

      <CreateCustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCustomerCreate={handleCreateCustomer}
      />
    </div>
  );
}
