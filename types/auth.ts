// DTOs equivalentes a los del backend

import { UserResponse } from "./user";

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
