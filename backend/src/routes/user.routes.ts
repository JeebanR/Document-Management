import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { userIdValidator, updateRoleValidator, listUsersValidator } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (ADMIN only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, MANAGER, EMPLOYEE] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       403:
 *         description: Forbidden — ADMIN only
 */
router.get('/', authenticate, authorize('ADMIN'), listUsersValidator, validate, userController.list.bind(userController));

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID (ADMIN only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, authorize('ADMIN'), userIdValidator, validate, userController.getById.bind(userController));

/**
 * @openapi
 * /users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user's role (ADMIN only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [ADMIN, MANAGER, EMPLOYEE] }
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', authenticate, authorize('ADMIN'), updateRoleValidator, validate, userController.updateRole.bind(userController));

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user (ADMIN only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, authorize('ADMIN'), userIdValidator, validate, userController.delete.bind(userController));

export default router;
