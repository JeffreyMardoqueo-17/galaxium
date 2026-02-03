// photo.service.ts
export async function uploadProductPhoto(
  productId: number,
  file: File,
  isPrimary: boolean = false
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("isPrimary", String(isPrimary));

  const response = await fetch(`/api/products/${productId}/photos`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error subiendo la imagen");
  }
}
