import request from 'supertest';
import app from '../../src/app';
import { setupTestDb, teardownTestDb } from './setup';

describe('Auth API', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user with EMPLOYEE role by default', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'Password123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.user.role).toBe('EMPLOYEE');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('rejects duplicate email registration', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Jane', email: 'dup@example.com', password: 'Password123' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Jane2', email: 'dup@example.com', password: 'Password123' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it('rejects invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Bad Email', email: 'not-an-email', password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects weak password (no digit)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Weak Pass', email: 'weak@example.com', password: 'onlyletters' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Login User', email: 'login@example.com', password: 'Password123' });
    });

    it('logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'WrongPassword1' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns user claims with a valid token', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'Password123' });

      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('login@example.com');
    });
  });
});
