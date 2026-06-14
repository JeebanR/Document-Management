import 'dotenv/config';
import sequelize from '../../src/config/database';

// Ensure required env vars exist for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads_test';

export async function setupTestDb(): Promise<void> {
  await sequelize.authenticate();
  // Force-sync recreates tables fresh for each test run — fine for an
  // isolated test database, never use force:true against real data.
  await sequelize.sync({ force: true });
}

export async function teardownTestDb(): Promise<void> {
  await sequelize.close();
}
