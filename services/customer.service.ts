  import { CustomerCreateRequestDTO, CustomerResponseDTO } from "@/types/custoner";
  import { getAuthHeaders } from "@/utils/getAddHeaders";
  import { number } from "framer-motion";

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";

  export async function GetAllCustomers(): Promise<CustomerResponseDTO[]> {
    const res = await fetch(`${API_URL}/Customer`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener clientes");
    return res.json();
  }

  export async function GetByIdCustomer(
    id: number,
  ): Promise<CustomerResponseDTO> {
    const res = await fetch(`${API_URL}/Customer/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error al obtener cliente");
    return res.json();
}
  export async function createCustomer(data: CustomerCreateRequestDTO) {
  const response = await fetch("http://localhost:5213/api/Customer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || "Error al crear cliente el service dice");
  }

  return await response.json();
}
