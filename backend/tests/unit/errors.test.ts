import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../src/utils/errors';

describe('Custom Error Classes', () => {
  it('AppError sets message, statusCode, and isOperational', () => {
    const err = new AppError('Something went wrong', 418);
    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(418);
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });

  it('ValidationError defaults to 400', () => {
    const err = new ValidationError('Bad input');
    expect(err.statusCode).toBe(400);
    expect(err).toBeInstanceOf(AppError);
  });

  it('AuthenticationError defaults to 401 with default message', () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Authentication failed');
  });

  it('ForbiddenError defaults to 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
  });

  it('NotFoundError formats message with resource name', () => {
    const err = new NotFoundError('Document');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Document not found');
  });

  it('ConflictError defaults to 409', () => {
    const err = new ConflictError('Email exists');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Email exists');
  });
});
