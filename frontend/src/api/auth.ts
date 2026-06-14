import { api } from './client';
import type { ApiSuccess, AuthResult } from '../types';

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await api.post<ApiSuccess<AuthResult>>('/auth/login', { email, password });
  return res.data.data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResult> {
  const res = await api.post<ApiSuccess<AuthResult>>('/auth/register', { name, email, password });
  return res.data.data;
}
