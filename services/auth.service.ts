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
