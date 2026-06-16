import fs from 'fs';
import path from 'path';
import {
  DocumentRepository,
  CreateDocumentDto,
  FindDocumentsOptions,
} from '../repositories/document.repository';
import Document from '../models/document.model';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';
import { cacheGet, cacheSet, cacheDel } from '../config/redis';
import { uploadToS3, deleteFromS3, isS3Enabled } from './s3.service';

const documentRepository = new DocumentRepository();
const CACHE_PREFIX = 'documents:list:';
const CACHE_TTL = 300; // 5 minutes

interface UploadFileInfo {
  originalname: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  buffer?: Buffer;
}

export class DocumentService {
  /**
   * Handles file persistence (local or S3) + metadata creation.
   */
  async upload(file: UploadFileInfo, title: string, uploadedBy: string): Promise<Document> {
    let fileUrl: string;

    if (isS3Enabled()) {
      fileUrl = await uploadToS3(file);
      // Clean up local temp file written by multer disk storage
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } else {
      fileUrl = `${process.env.APP_URL}/uploads/${file.filename}`;
    }

    const data: CreateDocumentDto = {
      title: title.trim(),
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy,
    };

    const document = await documentRepository.create(data);

    // Invalidate list cache on write
    await cacheDel(`${CACHE_PREFIX}*`);

    return document;
  }

  /**
   * List documents with pagination, search, sort, and role-based filtering.
   * - ADMIN/MANAGER: can see all documents, optionally filter by uploader.
   * - EMPLOYEE: can only see their own documents (filter is forced).
   */
  async list(
    query: {
      page?: string;
      limit?: string;
      search?: string;
      uploadedBy?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    requester: JwtPayload,
  ): Promise<{ rows: Document[]; count: number; page: number; limit: number }> {
    const page = Math.max(parseInt(query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100);

    const options: FindDocumentsOptions = {
      page,
      limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder === 'ASC' ? 'ASC' : 'DESC',
    };

    if (requester.role === 'EMPLOYEE') {
      // Employees can only ever see their own documents
      options.uploadedBy = requester.userId;
    } else if (query.uploadedBy) {
      // Admins/Managers can filter by any uploader
      options.uploadedBy = query.uploadedBy;
    }

    // Try cache first (cache key includes all query params + requester scope)
    const cacheKey = `${CACHE_PREFIX}${JSON.stringify({ ...options, role: requester.role })}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const { rows, count } = await documentRepository.findAll(options);
    const result = { rows, count, page, limit };

    await cacheSet(cacheKey, JSON.stringify(result), CACHE_TTL);
    return result;
  }

  async getById(id: string, requester: JwtPayload): Promise<Document> {
    const document = await documentRepository.findById(id);
    if (!document) throw new NotFoundError('Document');

    if (requester.role === 'EMPLOYEE' && document.uploadedBy !== requester.userId) {
      throw new ForbiddenError('You can only access your own documents');
    }

    return document;
  }

  /**
   * Permission rules for deletion:
   * - ADMIN: can delete any document
   * - MANAGER: can delete any document (per spec: upload + list only — no delete)
   * - EMPLOYEE: can delete only their own documents
   */
  async delete(id: string, requester: JwtPayload): Promise<void> {
    const document = await documentRepository.findById(id);
    if (!document) throw new NotFoundError('Document');

    const isOwner = document.uploadedBy === requester.userId;
    const isAdmin = requester.role === 'ADMIN';

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to delete this document');
    }

    // Managers without ownership are also blocked per RBAC spec (list/upload only)
    if (requester.role === 'MANAGER' && !isOwner) {
      throw new ForbiddenError('Managers can only delete their own documents');
    }

    // Remove physical file
    if (isS3Enabled() && document.fileUrl.includes('amazonaws.com')) {
      await deleteFromS3(document.fileUrl);
    } else {
      const filePath = path.join(process.cwd(), document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await documentRepository.delete(id);
    await cacheDel(`${CACHE_PREFIX}*`);
  }

  validatePdfFile(file?: Express.Multer.File): void {
    if (!file) {
      throw new ValidationError('A PDF file is required');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new ValidationError('Only PDF files are allowed');
    }
  }
}
