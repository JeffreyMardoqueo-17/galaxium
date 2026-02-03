export function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No autenticado");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}