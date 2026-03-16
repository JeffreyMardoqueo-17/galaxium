import { getAuthHeaders } from "@/utils/getAddHeaders";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

const API_URL = () => getApiBaseUrl();

export async function uploadProductPhoto(
  productId: number,
  file: File,
  isPrimary: boolean = false
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("isPrimary", String(isPrimary));

  const headers = { ...getAuthHeaders() };
  delete (headers as Record<string, string>)["Content-Type"];

  const response = await fetch(`${API_URL()}/products/${productId}/photos`, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error subiendo la imagen");
  }
}