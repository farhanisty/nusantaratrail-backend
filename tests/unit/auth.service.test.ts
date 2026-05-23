import bcrypt from 'bcryptjs';

// Mock prisma
jest.mock('../../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

import prisma from '../../src/config/prisma';
import { AuthService } from '../../src/services';
import { AppError } from '../../src/utils/AppError';

describe('AuthService.register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('berhasil register user baru', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      role: 'tourist',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await AuthService.register({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
    });

    expect(user.email).toBe('test@test.com');
    expect(user).not.toHaveProperty('password');
  });

  it('gagal register jika email sudah ada', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.com' });

    await expect(
      AuthService.register({ name: 'Test', email: 'test@test.com', password: '123456' })
    ).rejects.toThrow(AppError);
  });
});

describe('AuthService.login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('berhasil login dengan kredensial benar', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: hashed,
      role: 'tourist',
      isActive: true,
    });

    const result = await AuthService.login('test@test.com', 'password123');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  it('gagal login dengan password salah', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: hashed,
      role: 'tourist',
      isActive: true,
    });

    await expect(AuthService.login('test@test.com', 'salah')).rejects.toThrow(AppError);
  });
});
