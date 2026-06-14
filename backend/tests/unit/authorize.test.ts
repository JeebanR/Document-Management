import { Request, Response, NextFunction } from 'express';
import { authorize } from '../../src/middleware/authorize';
import { ForbiddenError, AuthenticationError } from '../../src/utils/errors';

describe('authorize middleware', () => {
  const mockRes = {} as Response;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  it('calls next() with no error when role is allowed', () => {
    const req = { user: { userId: '1', email: 'a@b.com', role: 'ADMIN' } } as unknown as Request;
    authorize('ADMIN', 'MANAGER')(req, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next() with ForbiddenError when role is not allowed', () => {
    const req = { user: { userId: '1', email: 'a@b.com', role: 'EMPLOYEE' } } as unknown as Request;
    authorize('ADMIN')(req, mockRes, next);

    const errArg = (next as jest.Mock).mock.calls[0][0];
    expect(errArg).toBeInstanceOf(ForbiddenError);
  });

  it('calls next() with AuthenticationError when req.user is missing', () => {
    const req = {} as Request;
    authorize('ADMIN')(req, mockRes, next);

    const errArg = (next as jest.Mock).mock.calls[0][0];
    expect(errArg).toBeInstanceOf(AuthenticationError);
  });

  it('allows EMPLOYEE for upload/list when included in roles', () => {
    const req = { user: { userId: '1', email: 'a@b.com', role: 'EMPLOYEE' } } as unknown as Request;
    authorize('ADMIN', 'MANAGER', 'EMPLOYEE')(req, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });
});
