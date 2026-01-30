// DTOs equivalentes a los del backend

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
