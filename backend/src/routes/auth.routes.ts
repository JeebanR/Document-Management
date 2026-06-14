import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { registerValidator, loginValidator, refreshTokenValidator } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (defaults to EMPLOYEE role)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Jane Doe" }
 *               email: { type: string, example: "jane@example.com" }
 *               password: { type: string, example: "Password123" }
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/register', registerValidator, validate, authController.register.bind(authController));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@docvault.io" }
 *               password: { type: string, example: "Admin@123" }
 *     responses:
 *       200:
 *         description: Login successful — returns access & refresh tokens
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/login', loginValidator, validate, authController.login.bind(authController));

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', refreshTokenValidator, validate, authController.refresh.bind(authController));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current authenticated user's claims
 *     responses:
 *       200:
 *         description: Current user info from JWT
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
