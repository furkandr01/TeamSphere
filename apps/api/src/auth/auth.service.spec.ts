import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: { findByEmail: jest.Mock; findById: jest.Mock; create: jest.Mock };
  let jwtService: { signAsync: jest.Mock };
  let redisService: { set: jest.Mock; get: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-access-token'),
    };
    redisService = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: {} },
        { provide: JwtService, useValue: jwtService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('throws UnauthorizedException if no user is found for the email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'MEMBER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'MEMBER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
    });
  });
});
