export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
  uploader?: { id: string; name: string; email: string };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}
