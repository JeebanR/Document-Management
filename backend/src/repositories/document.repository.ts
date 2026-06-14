import { Op, Order } from 'sequelize';
import Document, { DocumentAttributes } from '../models/document.model';
import User from '../models/user.model';

export interface CreateDocumentDto {
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
}

export interface FindDocumentsOptions {
  page: number;
  limit: number;
  search?: string;
  uploadedBy?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class DocumentRepository {
  async create(data: CreateDocumentDto): Promise<Document> {
    return Document.create(data);
  }

  async findById(id: string): Promise<Document | null> {
    return Document.findByPk(id, {
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    });
  }

  async findAll(options: FindDocumentsOptions): Promise<{ rows: Document[]; count: number }> {
    const { page, limit, search, uploadedBy, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    if (uploadedBy) {
      where.uploadedBy = uploadedBy;
    }

    // Whitelist sortable columns to prevent SQL injection
    const allowedSortColumns = ['title', 'createdAt', 'fileSize'];
    const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const order: Order = [[safeSort, sortOrder]];

    return Document.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Document.destroy({ where: { id } });
    return deleted > 0;
  }

  async countByUser(uploadedBy: string): Promise<number> {
    return Document.count({ where: { uploadedBy } });
  }
}
