import { body, param, query } from 'express-validator';

export const uploadDocumentValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
];

export const listDocumentsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['title', 'createdAt', 'fileSize']).withMessage('sortBy must be title, createdAt, or fileSize'),

  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('sortOrder must be ASC or DESC'),

  query('uploadedBy')
    .optional()
    .isUUID().withMessage('uploadedBy must be a valid UUID'),
];

export const documentIdValidator = [
  param('id')
    .isUUID().withMessage('Document id must be a valid UUID'),
];
