import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { sendSuccess, paginationMeta } from '../utils/response';
import { AuthenticationError } from '../utils/errors';

const documentService = new DocumentService();

export class DocumentController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AuthenticationError();

      documentService.validatePdfFile(req.file);

      const document = await documentService.upload(
        req.file as Express.Multer.File,
        req.body.title,
        req.user.userId,
      );

      sendSuccess(res, document, 201);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AuthenticationError();

      const { rows, count, page, limit } = await documentService.list(
        {
          page: req.query.page as string,
          limit: req.query.limit as string,
          search: req.query.search as string,
          uploadedBy: req.query.uploadedBy as string,
          sortBy: req.query.sortBy as string,
          sortOrder: req.query.sortOrder as string,
        },
        req.user,
      );

      sendSuccess(res, rows, 200, paginationMeta(page, limit, count));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AuthenticationError();
      const document = await documentService.getById(req.params.id, req.user);
      sendSuccess(res, document, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AuthenticationError();
      await documentService.delete(req.params.id, req.user);
      sendSuccess(res, { message: 'Document deleted successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }
}
