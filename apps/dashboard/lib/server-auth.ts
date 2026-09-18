import { NextRequest } from 'next/server';
import { prisma } from '@employr/db';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string | null;
  avatar_url?: string | null;
  education?: string | null;
  major?: string | null;
  last_company?: string | null;
  experience_year?: number | null;
  skills?: string[];
  target_job?: string | null;
  preferences?: any;
  onboarded?: boolean | null;
}

const USER_SELECT_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  avatar_url: true,
  education: true,
  major: true,
  last_company: true,
  experience_year: true,
  skills: true,
  target_job: true,
  preferences: true,
  onboarded: true,
};

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    // 1. Try secure session token from employr_auth_session / employr_auth_token (or legacy cuti_*)
    const authToken =
      req.cookies.get('employr_auth_session')?.value ||
      req.cookies.get('employr_auth_token')?.value ||
      req.cookies.get('cuti_auth_session')?.value ||
      req.cookies.get('cuti_auth_token')?.value;

    if (authToken && authToken.trim().length >= 16) {
      const session = await prisma.sessions.findUnique({
        where: { token: authToken.trim() },
        include: {
          users: {
            select: USER_SELECT_FIELDS,
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
              select: USER_SELECT_FIELDS,
            },
          },
        });

        if (session && session.expires_at > new Date() && session.users) {
          return session.users;
        }
      }
    }

    // 3. Fallback for active legacy cookie: strictly verify user exists in DB
    const legacyCookie = req.cookies.get('employr_user_session')?.value || req.cookies.get('cuti_user_session')?.value;
    if (legacyCookie) {
      try {
        const decoded = decodeURIComponent(legacyCookie);
        // If it's a raw token string (UUID/hex)
        if (!decoded.startsWith('{') && decoded.length >= 16) {
          const session = await prisma.sessions.findUnique({
            where: { token: decoded },
            include: {
              users: {
                select: USER_SELECT_FIELDS,
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
            select: USER_SELECT_FIELDS,
          });
          if (verifiedUser && (!parsed.email || verifiedUser.email.toLowerCase() === parsed.email.toLowerCase())) {
            return verifiedUser;
          }
        }

        // Fallback: verify user by email if ID is missing or mismatched
        if (parsed?.email) {
          const cleanEmail = parsed.email.toLowerCase().trim();
          let verifiedUser = await prisma.user.findFirst({
            where: { email: cleanEmail },
            select: USER_SELECT_FIELDS,
          });

          // Auto-provision if user email is valid but doesn't exist yet (e.g. dev/demo login)
          if (!verifiedUser && cleanEmail.includes('@')) {
            try {
              const newId = parsed.id && parsed.id.length === 36 ? parsed.id : crypto.randomUUID();
              verifiedUser = await prisma.user.create({
                data: {
                  id: newId,
                  email: cleanEmail,
                  name: parsed.name || 'Pengguna Employr',
                  role: 'USER',
                  updated_at: new Date(),
                },
                select: USER_SELECT_FIELDS,
              });
            } catch (createErr) {
              console.warn('[server-auth] Auto-provision user error:', createErr);
            }
          }

          if (verifiedUser) {
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
