export interface UserResponse {
  id: number;
  fullName: string;
  username: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserUpdateRoleRequest {
  roleId: number;
}

export interface UserUpdateStatusRequest {
  isActive: boolean;
}
