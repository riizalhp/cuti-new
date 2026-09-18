import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ENABLE_CRON: z.string().transform(v => v === 'true').default('false'),
  CRON_TIMEZONE: z.string().default('Asia/Jakarta'),
  JOB_SYNC_GRACE_DAYS: z.string().transform(Number).default('3'),
  LOGO_STORAGE_PATH: z.string().default('public/uploads/logos'),
  CDN_BASE_URL: z.string().default('/uploads/logos'),
  SEAWEEDFS_URL: z.string().optional(),
  SEAWEEDFS_FILER_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_ADMIN_URL: z.string().optional(),
  NEXT_PUBLIC_WEB_URL: z.string().optional(),
  PORT: z.string().transform(Number).default('3000'),
  CORS_ORIGINS: z.string().optional(),
  ADMIN_SESSION_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }
  
  if (parsed.data.NODE_ENV === 'production' && !parsed.data.JWT_SECRET) {
     throw new Error('JWT_SECRET is required in production');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

// Lazy validation via Proxy so we don't crash on import, only on access
export const env = new Proxy({} as Env, {
  get(_target, prop) {
    if (typeof prop !== 'string') return undefined;
    const currentEnv = validateEnv();
    return currentEnv[prop as keyof Env];
  }
});
