import { UserResponse, UserUpdateRoleRequest, UserUpdateStatusRequest } from "@/types/user";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";
import { getAuthHeaders } from "@/utils/getAddHeaders";

const API_URL = () => `${getApiBaseUrl()}/User`;
export const UNAUTHORIZED_USER_ERROR = "UNAUTHORIZED";

export interface RoleResponse {
  id: number;
  name: string;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = (await res.json()) as { message?: string };
      if (payload.message) {
        return payload.message;
      }
    }

    const text = (await res.text()).trim();
    if (text) {
      return text;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

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

export async function getAllUsers(): Promise<UserResponse[]> {
  const res = await fetch(`${API_URL()}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_USER_ERROR);
    }

    throw new Error(await readErrorMessage(res, `USER_LIST_FAILED_${res.status}`));
  }

  return res.json();
}

export async function updateUserRole(userId: number, payload: UserUpdateRoleRequest): Promise<UserResponse> {
  const res = await fetch(`${API_URL()}/${userId}/role`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_USER_ERROR);
    }

    throw new Error(await readErrorMessage(res, `USER_ROLE_UPDATE_FAILED_${res.status}`));
  }

  return res.json();
}

export async function updateUserStatus(userId: number, payload: UserUpdateStatusRequest): Promise<UserResponse> {
  const res = await fetch(`${API_URL()}/${userId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_USER_ERROR);
    }

    throw new Error(await readErrorMessage(res, `USER_STATUS_UPDATE_FAILED_${res.status}`));
  }

  return res.json();
}

export async function getRoles(): Promise<RoleResponse[]> {
  const res = await fetch(`${getApiBaseUrl()}/Role`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(UNAUTHORIZED_USER_ERROR);
    }

    throw new Error(await readErrorMessage(res, `ROLES_REQUEST_FAILED_${res.status}`));
  }

  return res.json();
}
