import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../../src/app';
import { setupTestDb, teardownTestDb } from './setup';
import User from '../../src/models/user.model';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const SAMPLE_PDF = path.join(FIXTURES_DIR, 'sample.pdf');
const SAMPLE_TXT = path.join(FIXTURES_DIR, 'sample.txt');

describe('Documents API', () => {
  let employeeToken: string;
  let employeeId: string;
  let managerToken: string;
  let adminToken: string;
  let employee2Token: string;
  let employee2Id: string;
  let uploadedDocId: string;

  beforeAll(async () => {
    await setupTestDb();

    // Create test fixture files
    if (!fs.existsSync(FIXTURES_DIR)) fs.mkdirSync(FIXTURES_DIR, { recursive: true });
    fs.writeFileSync(SAMPLE_PDF, '%PDF-1.4\n%%EOF'); // minimal valid-ish PDF header
    fs.writeFileSync(SAMPLE_TXT, 'this is not a pdf');

    // Register users via API (always EMPLOYEE), then promote some directly via model
    const empRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Employee One', email: 'emp1@example.com', password: 'Password123' });
    employeeToken = empRes.body.data.accessToken;
    employeeId = empRes.body.data.user.id;

    const emp2Res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Employee Two', email: 'emp2@example.com', password: 'Password123' });
    employee2Id = emp2Res.body.data.user.id;

    // Promote a user to MANAGER and one to ADMIN directly (simulating admin action)
    await User.update({ role: 'MANAGER' }, { where: { email: 'emp2@example.com' } });
    const managerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'emp2@example.com', password: 'Password123' });
    managerToken = managerLogin.body.data.accessToken;
    employee2Token = managerToken; // same user, now manager

    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Admin User', email: 'admin-test@example.com', password: 'Password123' });
    await User.update({ role: 'ADMIN' }, { where: { email: 'admin-test@example.com' } });
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin-test@example.com', password: 'Password123' });
    adminToken = adminLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await teardownTestDb();
    // Clean up fixtures and uploaded files
    fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
    const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads_test');
    if (fs.existsSync(uploadDir)) fs.rmSync(uploadDir, { recursive: true, force: true });
  });

  describe('POST /api/v1/documents/upload', () => {
    it('rejects upload without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .field('title', 'Test Doc')
        .attach('file', SAMPLE_PDF);

      expect(res.status).toBe(401);
    });

    it('rejects non-PDF files', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('title', 'Bad File')
        .attach('file', SAMPLE_TXT);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/PDF/i);
    });

    it('rejects upload without a title', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${employeeToken}`)
        .attach('file', SAMPLE_PDF);

      expect(res.status).toBe(400);
    });

    it('allows EMPLOYEE to upload their own PDF', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('title', 'Employee Report')
        .attach('file', SAMPLE_PDF);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Employee Report');
      expect(res.body.data.mimeType).toBe('application/pdf');
      expect(res.body.data.uploadedBy).toBe(employeeId);

      uploadedDocId = res.body.data.id;
    });

    it('allows MANAGER to upload a PDF', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${managerToken}`)
        .field('title', 'Manager Report')
        .attach('file', SAMPLE_PDF);

      expect(res.status).toBe(201);
    });

    it('allows ADMIN to upload a PDF', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Admin Report')
        .attach('file', SAMPLE_PDF);

      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/v1/documents', () => {
    it('rejects request without authentication', async () => {
      const res = await request(app).get('/api/v1/documents');
      expect(res.status).toBe(401);
    });

    it('EMPLOYEE sees only their own documents', async () => {
      const res = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // All returned documents must belong to this employee
      for (const doc of res.body.data) {
        expect(doc.uploadedBy).toBe(employeeId);
      }
    });

    it('ADMIN sees all documents', async () => {
      const res = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      // Admin should see at least the 3 documents uploaded above
      expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
    });

    it('supports search by title', async () => {
      const res = await request(app)
        .get('/api/v1/documents?search=Manager')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toMatch(/Manager/i);
    });

    it('supports pagination', async () => {
      const res = await request(app)
        .get('/api/v1/documents?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta.limit).toBe(1);
      expect(res.body.meta.page).toBe(1);
    });

    it('EMPLOYEE cannot bypass scope using uploadedBy filter', async () => {
      const res = await request(app)
        .get(`/api/v1/documents?uploadedBy=${employee2Id}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      // Should still be scoped to the employee's own docs, not employee2's
      for (const doc of res.body.data) {
        expect(doc.uploadedBy).toBe(employeeId);
      }
    });
  });

  describe('DELETE /api/v1/documents/:id', () => {
    it('rejects delete from a different EMPLOYEE', async () => {
      // employee2 (now manager) tries deleting employee1's doc — should fail
      // since manager is not owner and not admin
      const res = await request(app)
        .delete(`/api/v1/documents/${uploadedDocId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(403);
    });

    it('allows owner (EMPLOYEE) to delete their own document', async () => {
      const res = await request(app)
        .delete(`/api/v1/documents/${uploadedDocId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for already-deleted document', async () => {
      const res = await request(app)
        .delete(`/api/v1/documents/${uploadedDocId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid UUID', async () => {
      const res = await request(app)
        .delete('/api/v1/documents/not-a-uuid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });
});
