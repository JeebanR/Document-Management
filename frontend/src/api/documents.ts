import { api } from './client';
import type { ApiSuccess, Document, PaginationMeta } from '../types';

export interface ListDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'fileSize';
  sortOrder?: 'ASC' | 'DESC';
  uploadedBy?: string;
}

export async function listDocuments(
  params: ListDocumentsParams,
): Promise<{ documents: Document[]; meta: PaginationMeta }> {
  const res = await api.get<ApiSuccess<Document[]>>('/documents', { params });
  return { documents: res.data.data, meta: res.data.meta! };
}

export async function uploadDocument(title: string, file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);

  const res = await api.post<ApiSuccess<Document>>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}
