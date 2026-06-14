import { UserRepository } from '../repositories/user.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors';
import { UserRole } from '../models/user.model';

interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginDto {
  email: string;
  password: string;
}

interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

const userRepository = new UserRepository();

export class AuthService {
  async register(data: RegisterDto): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(data.email.toLowerCase());
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    // Public registration always defaults to EMPLOYEE — role escalation
    // must be done via the admin user-management endpoint.
    const user = await userRepository.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: 'EMPLOYEE',
    });

    return this.buildAuthResult(user.id, user.email, user.role, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  }

  async login(data: LoginDto): Promise<AuthResult> {
    const user = await userRepository.findByEmail(data.email.toLowerCase());
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    return this.buildAuthResult(user.id, user.email, user.role, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }

  private buildAuthResult(
    userId: string,
    email: string,
    role: UserRole,
    userProfile: AuthResult['user'],
  ): AuthResult {
    const payload = { userId, email, role };
    return {
      user: userProfile,
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }
}
