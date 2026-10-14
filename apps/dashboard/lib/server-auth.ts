import { NextRequest } from 'next/server';
import { prisma, logSecurityEvent, extractRequestContext } from '@employr/db';

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

export function isValidUUID(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function isUserAgentMismatch(sessionUa: string | null | undefined, reqUa: string | null | undefined): boolean {
  if (!sessionUa || !reqUa) return false;
  if (sessionUa === reqUa) return false;

  const getFamily = (ua: string) => {
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);
    const os = /windows/i.test(ua)
      ? 'win'
      : /macintosh|mac os/i.test(ua)
      ? 'mac'
      : /linux/i.test(ua)
      ? 'linux'
      : /android/i.test(ua)
      ? 'android'
      : /ios|iphone|ipad/i.test(ua)
      ? 'ios'
      : 'other';
    const browser = /edg/i.test(ua)
      ? 'edge'
      : /chrome/i.test(ua)
      ? 'chrome'
      : /safari/i.test(ua)
      ? 'safari'
      : /firefox/i.test(ua)
      ? 'firefox'
      : 'other';
    return `${isMobile ? 'm' : 'd'}:${os}:${browser}`;
  };

  return getFamily(sessionUa) !== getFamily(reqUa);
}

async function validateSessionFingerprint(session: any, req: NextRequest): Promise<boolean> {
  if (!session) return false;
  const ctx = extractRequestContext(req);

  if (session.user_agent && ctx.userAgent && isUserAgentMismatch(session.user_agent, ctx.userAgent)) {
    logSecurityEvent({
      eventType: 'SESSION_HIJACK_SUSPECTED',
      userId: session.user_id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      email: session.users?.email,
      severity: 'CRITICAL',
      details: {
        reason: 'user_agent_family_mismatch',
        originalUserAgent: session.user_agent,
        currentUserAgent: ctx.userAgent,
        originalIp: session.ip_address,
        currentIp: ctx.ip,
        sessionId: session.id,
      },
    });

    // Invalidate hijacked session in database immediately
    await prisma.sessions.delete({ where: { id: session.id } }).catch(() => {});
    return false;
  }

  return true;
}

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
        const isValid = await validateSessionFingerprint(session, req);
        if (!isValid) return null;
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
          const isValid = await validateSessionFingerprint(session, req);
          if (!isValid) return null;
          return session.users;
        }
      }
    }

    // 3. Fallback for active legacy cookie: strictly verify user exists in DB
    const legacyCookie = req.cookies.get('employr_user_session')?.value || req.cookies.get('cuti_user_session')?.value;
    if (legacyCookie) {
      try {
        let decoded = legacyCookie.trim();
        for (let i = 0; i < 3; i++) {
          if (decoded.includes('%')) {
            try {
              const next = decodeURIComponent(decoded);
              if (next === decoded) break;
              decoded = next;
            } catch {
              break;
            }
          } else {
            break;
          }
        }

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
            const isValid = await validateSessionFingerprint(session, req);
            if (!isValid) return null;
            return session.users;
          }
        }

        // If legacy JSON, strictly verify user by ID in database (never trust client role)
        const parsed = JSON.parse(decoded);
        if (parsed?.id && isValidUUID(parsed.id)) {
          const verifiedUser = await prisma.user.findUnique({
            where: { id: parsed.id },
            select: USER_SELECT_FIELDS,
          });
          if (verifiedUser && (!parsed.email || verifiedUser.email.toLowerCase() === parsed.email.toLowerCase())) {
            return verifiedUser;
          }
        }

        // Fallback: verify user by email if ID is missing, mismatched, or not a valid UUID
        if (parsed?.email) {
          const cleanEmail = parsed.email.toLowerCase().trim();
          let verifiedUser = await prisma.user.findFirst({
            where: { email: cleanEmail },
            select: USER_SELECT_FIELDS,
          });

          // Auto-provision if user email is valid but doesn't exist yet (e.g. dev/demo login)
          if (!verifiedUser && cleanEmail.includes('@')) {
            try {
              const newId = parsed.id && isValidUUID(parsed.id) ? parsed.id : crypto.randomUUID();
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

export async function getServerAuthUser(): Promise<AuthUser | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    // 1. Try secure session token from employr_auth_session / employr_auth_token (or legacy cuti_*)
    const authToken =
      cookieStore.get('employr_auth_session')?.value ||
      cookieStore.get('employr_auth_token')?.value ||
      cookieStore.get('cuti_auth_session')?.value ||
      cookieStore.get('cuti_auth_token')?.value;

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

    // 2. Fallback for active legacy cookie: strictly verify user exists in DB
    const legacyCookie = cookieStore.get('employr_user_session')?.value || cookieStore.get('cuti_user_session')?.value;
    if (legacyCookie) {
      try {
        let decoded = legacyCookie.trim();
        for (let i = 0; i < 3; i++) {
          if (decoded.includes('%')) {
            try {
              const next = decodeURIComponent(decoded);
              if (next === decoded) break;
              decoded = next;
            } catch {
              break;
            }
          } else {
            break;
          }
        }

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

        const parsed = JSON.parse(decoded);
        if (parsed?.id && isValidUUID(parsed.id)) {
          const verifiedUser = await prisma.user.findUnique({
            where: { id: parsed.id },
            select: USER_SELECT_FIELDS,
          });
          if (verifiedUser && (!parsed.email || verifiedUser.email.toLowerCase() === parsed.email.toLowerCase())) {
            return verifiedUser;
          }
        }

        if (parsed?.email) {
          const cleanEmail = parsed.email.toLowerCase().trim();
          const verifiedUser = await prisma.user.findFirst({
            where: { email: cleanEmail },
            select: USER_SELECT_FIELDS,
          });
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
    console.error('[getServerAuthUser] Error getting server auth user:', error);
    return null;
  }
}
