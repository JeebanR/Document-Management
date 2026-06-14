import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { handleUpload } from '../middleware/upload';
import {
  uploadDocumentValidator,
  listDocumentsValidator,
  documentIdValidator,
} from '../validators/document.validator';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const documentController = new DocumentController();

// Wrap multer's handleUpload (which can reject with file-filter errors)
// so it integrates with the centralized error handler.
function multerMiddleware(req: Request, res: Response, next: NextFunction): void {
  handleUpload(req, res)
    .then(() => next())
    .catch(next);
}

/**
 * @openapi
 * /documents/upload:
 *   post:
 *     tags: [Documents]
 *     summary: Upload a PDF document (ADMIN, MANAGER, EMPLOYEE)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, file]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Q3 Financial Report"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file only, max size configured by MAX_FILE_SIZE
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       400:
 *         description: Invalid file type or missing title
 *       401:
 *         description: Not authenticated
 */
router.post(
  '/upload',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  multerMiddleware,
  uploadDocumentValidator,
  validate,
  documentController.upload.bind(documentController),
);

/**
 * @openapi
 * /documents:
 *   get:
 *     tags: [Documents]
 *     summary: List documents with pagination, search, sort, and filtering
 *     description: |
 *       - ADMIN and MANAGER see all documents (optionally filtered by `uploadedBy`).
 *       - EMPLOYEE sees only their own documents regardless of `uploadedBy`.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive search by document title
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [title, createdAt, fileSize], default: createdAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [ASC, DESC], default: DESC }
 *       - in: query
 *         name: uploadedBy
 *         schema: { type: string, format: uuid }
 *         description: Filter by uploader ID (ADMIN/MANAGER only)
 *     responses:
 *       200:
 *         description: Paginated list of documents
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  listDocumentsValidator,
  validate,
  documentController.list.bind(documentController),
);

/**
 * @openapi
 * /documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get a single document by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Document found
 *       403:
 *         description: Forbidden — not your document (EMPLOYEE)
 *       404:
 *         description: Document not found
 */
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  documentIdValidator,
  validate,
  documentController.getById.bind(documentController),
);

/**
 * @openapi
 * /documents/{id}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete a document
 *     description: |
 *       - ADMIN can delete any document.
 *       - EMPLOYEE can delete only their own documents.
 *       - MANAGER can delete only their own documents (per RBAC spec, managers have list/upload but not delete-all).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       403:
 *         description: Forbidden — insufficient permission
 *       404:
 *         description: Document not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'EMPLOYEE'),
  documentIdValidator,
  validate,
  documentController.delete.bind(documentController),
);

export default router;
