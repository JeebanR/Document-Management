import { api } from './client';
import type { ApiSuccess, User, UserRole, PaginationMeta } from '../types';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export async function listUsers(
  params: ListUsersParams,
): Promise<{ users: User[]; meta: PaginationMeta }> {
  const res = await api.get<ApiSuccess<User[]>>('/users', { params });
  return { users: res.data.data, meta: res.data.meta! };
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  const res = await api.patch<ApiSuccess<User>>(`/users/${id}/role`, { role });
  return res.data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
