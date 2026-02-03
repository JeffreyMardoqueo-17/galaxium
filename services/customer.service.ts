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

export async function CreateCustomer(data: CustomerCreateRequestDTO): Promise<CustomerResponseDTO> {
  const res = await fetch(`${API_URL}/Customer`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al crear cliente");
  return res.json();
}