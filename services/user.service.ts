import { UserResponse } from "@/types/user";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";
import { getAuthHeaders } from "@/utils/getAddHeaders";

const API_URL = () => `${getApiBaseUrl()}/User`;
export const UNAUTHORIZED_USER_ERROR = "UNAUTHORIZED";

export async function getCurrentUser(): Promise<UserResponse> {
  const res = await fetch(`${API_URL()}/me`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_USER_ERROR);
    }

    throw new Error("USER_REQUEST_FAILED");
  }

  return res.json();
}
