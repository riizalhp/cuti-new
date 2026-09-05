import { NextRequest } from 'next/server';
import { prisma } from '@cuti/db';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    // 1. Try secure session token from cuti_auth_session or cuti_user_session cookie
    const authToken =
      req.cookies.get('cuti_auth_session')?.value ||
      req.cookies.get('cuti_auth_token')?.value;

    if (authToken && authToken.trim().length >= 16) {
      const session = await prisma.sessions.findUnique({
        where: { token: authToken.trim() },
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      if (session && session.expires_at > new Date() && session.users) {
        return session.users;
      }
    }

    // 2. Try Authorization Header (Bearer token lookup in sessions table)
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      if (bearerToken.length >= 16) {
        const session = await prisma.sessions.findUnique({
          where: { token: bearerToken },
          include: {
            users: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        });

        if (session && session.expires_at > new Date() && session.users) {
          return session.users;
        }
      }
    }

    // 3. Fallback for active legacy cookie: strictly verify user exists in DB
    const legacyCookie = req.cookies.get('cuti_user_session')?.value;
    if (legacyCookie) {
      try {
        const decoded = decodeURIComponent(legacyCookie);
        // If it's a raw token string (UUID/hex)
        if (!decoded.startsWith('{') && decoded.length >= 16) {
          const session = await prisma.sessions.findUnique({
            where: { token: decoded },
            include: {
              users: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          });
          if (session && session.expires_at > new Date() && session.users) {
            return session.users;
          }
        }

        // If legacy JSON, strictly verify user by ID in database (never trust client role)
        const parsed = JSON.parse(decoded);
        if (parsed?.id) {
          const verifiedUser = await prisma.user.findUnique({
            where: { id: parsed.id },
            select: { id: true, name: true, email: true, role: true },
          });
          if (verifiedUser && (!parsed.email || verifiedUser.email.toLowerCase() === parsed.email.toLowerCase())) {
            return verifiedUser;
          }
        }
      } catch {
        // Invalid cookie syntax
      }
    }

    return null;
  } catch (error) {
    console.error('[getAuthUser] Error getting auth user:', error);
    return null;
  }
}
