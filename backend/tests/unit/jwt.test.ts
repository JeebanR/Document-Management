import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../../src/utils/jwt';

describe('JWT Utils', () => {
  const payload = { userId: 'user-123', email: 'test@example.com', role: 'EMPLOYEE' };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  it('signs and verifies an access token', () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('signs and verifies a refresh token', () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);

    expect(decoded.userId).toBe(payload.userId);
  });

  it('throws when verifying an invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('throws when verifying an access token with the refresh verifier', () => {
    const token = signAccessToken(payload);
    expect(() => verifyRefreshToken(token)).toThrow();
  });
});
