import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private verifyPassword(password: string, storedHash: string): boolean {
    if (storedHash.includes(':')) {
      try {
        const parts = storedHash.split(':');
        if (parts.length === 2) {
          const [salt, originalHash] = parts;
          const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
          if (testHash === originalHash) return true;
        }
      } catch {}
    }
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch {
      return false;
    }
  }

  async register(dto: RegisterDto) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();
    const membershipId = crypto.randomUUID();
    const now = new Date();

    const [user] = await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          id: userId,
          email: cleanEmail,
          name: dto.name.trim(),
          role: 'USER',
          updated_at: now,
        },
      }),
      this.prisma.accounts.create({
        data: {
          id: accountId,
          user_id: userId,
          account_id: userId,
          provider_id: 'credential',
          password: hashedPassword,
          updated_at: now,
        },
      }),
      this.prisma.membership.create({
        data: {
          id: membershipId,
          user_id: userId,
          tier: 'FREE',
          is_lifetime: true,
          is_active: true,
        },
      }),
    ]);

    const tokens = this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        accounts: {
          where: { provider_id: 'credential' },
        },
      },
    });

    if (!user || !user.accounts || user.accounts.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const account = user.accounts[0];
    if (!account.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = this.verifyPassword(dto.password, account.password);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private generateTokens(userId: string) {
    // Simplified token generation — use JWT in production
    const accessToken = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 900000 })).toString('base64');
    const refreshToken = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 604800000 })).toString('base64');

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { accounts, ...sanitized } = user;
    return sanitized;
  }
}
