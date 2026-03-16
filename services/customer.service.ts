  import { CustomerCreateRequestDTO, CustomerResponseDTO } from "@/types/custoner";
  import { getAuthHeaders } from "@/utils/getAddHeaders";
  import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

  const API_URL = () => getApiBaseUrl();

  export async function GetAllCustomers(): Promise<CustomerResponseDTO[]> {
    const res = await fetch(`${API_URL()}/Customer`, {
      method: "GET",
      headers: getAuthHeaders(),
    credentials: 'include',
    });
    if (!res.ok) throw new Error("Error al obtener clientes");
    return res.json();
  }

  export async function GetByIdCustomer(
    id: number,
  ): Promise<CustomerResponseDTO> {
    const res = await fetch(`${API_URL()}/Customer/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    credentials: 'include',
    });
    if (!res.ok) throw new Error("Error al obtener cliente");
    return res.json();
}
  export async function createCustomer(data: CustomerCreateRequestDTO) {
  const response = await fetch(`${API_URL()}/Customer`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || "Error al crear cliente el service dice");
  }

  return await response.json();
}
