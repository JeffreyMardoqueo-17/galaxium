import { UserResponse } from "@/types/user";

const API_URL = "http://localhost:5213/api/User";

export async function getCurrentUser(): Promise<UserResponse> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No autenticado");
  }

  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("No autenticado");
  }

  return res.json();
}
