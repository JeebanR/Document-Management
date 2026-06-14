import { body, param, query } from 'express-validator';

export const userIdValidator = [
  param('id')
    .isUUID().withMessage('User id must be a valid UUID'),
];

export const updateRoleValidator = [
  param('id')
    .isUUID().withMessage('User id must be a valid UUID'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Role must be ADMIN, MANAGER, or EMPLOYEE'),
];

export const listUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),

  query('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('role must be ADMIN, MANAGER, or EMPLOYEE'),
];
