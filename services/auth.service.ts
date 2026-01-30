// services/auth.service.ts
import { UserLoginRequest } from "@/types/auth";

export async function login(data: UserLoginRequest) {
  const res = await fetch("http://localhost:5213/api/User/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Login fallido");
  }

  return res.json(); // EVUELVE tokens + user
}

export async function logout () {
  // Implementar la lógica de cierre de sesión si es necesario
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}