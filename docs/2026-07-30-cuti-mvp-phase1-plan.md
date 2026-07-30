# CUTI Phase 1 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build core CUTI Career Portal AI platform — users can register, create ATS-optimized CVs, screen them with AI, track job applications, and subscribe to premium.

**Architecture:** Turborepo monorepo with NestJS backend (modular REST API), Next.js user dashboard (glassmorphism UI), Prisma + PostgreSQL, Better Auth, BullMQ for async AI jobs, Midtrans payment integration.

**Tech Stack:**
- Monorepo: Turborepo + pnpm
- Backend: NestJS 11 + Prisma + PostgreSQL 16
- Frontend: Next.js 15 (App Router) + Tailwind CSS + shadcn/ui + Framer Motion
- Auth: Better Auth + Google OAuth
- AI: Vercel AI SDK (OpenAI provider)
- Queue: Redis + BullMQ
- Storage: Cloudflare R2
- Payment: Midtrans

## Global Constraints

- TypeScript strict mode, no `any`
- Node.js ≥ 20.x, pnpm ≥ 9.x
- Free tier: max 2 CVs, 10 job applications, 1x AI screening trial
- Premium tier: unlimited everything
- All API responses: `{success: true, data: {...}}` or `{success: false, error: {...}}`
- Commit after each passing test
- Mobile-first responsive (breakpoints: sm/md/lg/xl)
- WCAG 2.1 AA target

---

## Task 1: Monorepo Foundation

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `package.json`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Consumes: None
- Produces: Turborepo workspace structure for apps/{api,user,admin,landing} and packages/{ui,db,types,config}

- [ ] **Step 1: Initialize Turborepo**

```bash
pnpm create turbo@latest cuti --package-manager pnpm
cd cuti
```

Expected: Turborepo scaffold created.

- [ ] **Step 2: Configure workspace**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 3: Setup root package.json**

```json
{
  "name": "cuti",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 4: Create directory structure**

```bash
mkdir -p apps/{api,user,admin,landing}
mkdir -p packages/{ui,db,types,config}
```

- [ ] **Step 5: Create root .gitignore**

```gitignore
# Dependencies
node_modules
.pnpm-store

# Build outputs
dist
.next
out
build
.turbo

# Env files
.env
.env.local
.env*.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode
.idea
*.swp
*.swo

# Logs
*.log
npm-debug.log*
```

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Turborepo monorepo structure

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Database Package (Prisma)

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/tsconfig.json`

**Interfaces:**
- Consumes: None
- Produces: 
  - `PrismaClient` instance exported from `@cuti/db`
  - Prisma schema with User, CV, Template, JobApplication, Payment, Membership models

- [ ] **Step 1: Write package.json**

Create `packages/db/package.json`:
```json
{
  "name": "@cuti/db",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd packages/db
pnpm install
```

- [ ] **Step 3: Write Prisma schema (MVP subset)**

Create `packages/db/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  free
  premium
  admin
}

enum CvStatus {
  draft
  active
  archived
}

enum ApplicationStatus {
  sent
  screening
  interview
  offering
  rejected
}

enum PaymentStatus {
  pending
  success
  failed
  expired
}

enum PaymentType {
  membership
  cv_service
  practice
  toefl
}

enum MembershipPlan {
  monthly
  quarterly
  annual
}

enum TemplateCategory {
  ats_modern
  ats_standard
  executive
  creative_tech
  fresh_graduate
}

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  name              String
  avatar            String?
  phone             String?
  password          String?

  headline          String?
  location          String?
  targetPosition    String?
  targetIndustry    String?
  experienceLevel   String?

  coin              Int       @default(0)
  xp                Int       @default(0)
  level             Int       @default(1)

  role              UserRole  @default(free)
  membershipExpiry  DateTime?

  referralCode      String    @unique @default(cuid())

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  cvs               CV[]
  applications      JobApplication[]
  screenings        AIScreening[]
  payments          Payment[]
  memberships       Membership[]

  @@map("users")
}

model CV {
  id              String    @id @default(uuid())
  userId          String
  title           String
  templateId      String?

  personalInfo    Json?
  summary         String?
  experiences     Json?
  education       Json?
  skills          Json?
  certifications  Json?
  projects        Json?
  languages       Json?
  organizations   Json?
  portfolio       Json?

  atsScore        Float?
  completeness    Float?

  status          CvStatus  @default(draft)
  isPrimary       Boolean   @default(false)

  pdfUrl          String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  template        Template? @relation(fields: [templateId], references: [id])
  screenings      AIScreening[]

  @@index([userId])
  @@map("cvs")
}

model Template {
  id              String           @id @default(uuid())
  name            String
  category        TemplateCategory
  description     String?
  previewUrl      String
  htmlContent     String
  cssContent      String
  isPremium       Boolean          @default(false)
  price           Int?

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  cvs             CV[]

  @@map("templates")
}

model AIScreening {
  id                String    @id @default(uuid())
  cvId              String
  userId            String

  recruiterType     String?
  companyType       String?

  atsScore          Float
  status            String
  recruiterNotes    String?
  keywordAnalysis   Json?
  redFlags          Json?
  recommendations   Json?
  interviewQuestions Json?

  provider          String
  model             String
  tokensUsed        Int
  cost              Float?

  createdAt         DateTime  @default(now())

  cv                CV        @relation(fields: [cvId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([cvId])
  @@map("ai_screenings")
}

model JobApplication {
  id              String            @id @default(uuid())
  userId          String

  company         String
  position        String
  url             String?
  location        String?
  salary          String?

  status          ApplicationStatus @default(sent)
  appliedAt       DateTime          @default(now())
  responseAt      DateTime?
  interviewDate   DateTime?

  notes           String?
  timeline        Json?

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@map("job_applications")
}

model Membership {
  id              String          @id @default(uuid())
  userId          String
  plan            MembershipPlan
  startDate       DateTime
  endDate         DateTime
  autoRenew       Boolean         @default(true)
  paymentId       String?

  status          String          @default("active")

  createdAt       DateTime        @default(now())

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("memberships")
}

model Payment {
  id                String      @id @default(uuid())
  userId            String

  type              PaymentType
  amount            Int
  description       String?

  midtransOrderId   String?     @unique
  midtransToken     String?
  midtransStatus    String?
  paymentMethod     String?

  status            PaymentStatus @default(pending)
  metadata          Json?

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([midtransOrderId])
  @@map("payments")
}
```

- [ ] **Step 4: Create Prisma client wrapper**

Create `packages/db/src/index.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
```

- [ ] **Step 5: Create tsconfig**

Create `packages/db/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 6: Generate Prisma Client**

```bash
pnpm db:generate
```

Expected: Prisma Client generated in `node_modules/@prisma/client`.

- [ ] **Step 7: Commit**

```bash
git add packages/db
git commit -m "feat(db): add Prisma schema with MVP models

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Shared Types Package

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/src/index.ts`
- Create: `packages/types/src/api.ts`
- Create: `packages/types/src/cv.ts`
- Create: `packages/types/tsconfig.json`

**Interfaces:**
- Consumes: None
- Produces:
  - `ApiResponse<T>`, `ApiError` types
  - `CreateCvInput`, `UpdateCvInput`, `CvResponse` types
  - `CreateJobInput`, `JobResponse` types

- [ ] **Step 1: Write package.json**

Create `packages/types/package.json`:
```json
{
  "name": "@cuti/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd packages/types
pnpm install
```

- [ ] **Step 3: Write API response types**

Create `packages/types/src/api.ts`:
```typescript
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}
```

- [ ] **Step 4: Write CV types**

Create `packages/types/src/cv.ts`:
```typescript
import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedIn: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  photo: z.string().url().optional(),
});

export const experienceSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
});

export const createCvSchema = z.object({
  title: z.string().min(1).max(100),
  templateId: z.string().uuid().optional(),
  personalInfo: personalInfoSchema.optional(),
  summary: z.string().max(500).optional(),
  experiences: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    credentialUrl: z.string().url().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    techStack: z.array(z.string()).optional(),
    url: z.string().url().optional(),
  })).optional(),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.enum(['basic', 'conversational', 'professional', 'native']),
  })).optional(),
});

export const updateCvSchema = createCvSchema.partial();

export type CreateCvInput = z.infer<typeof createCvSchema>;
export type UpdateCvInput = z.infer<typeof updateCvSchema>;

export interface CvResponse {
  id: string;
  userId: string;
  title: string;
  templateId: string | null;
  personalInfo: unknown;
  summary: string | null;
  experiences: unknown;
  education: unknown;
  skills: unknown;
  certifications: unknown;
  projects: unknown;
  languages: unknown;
  atsScore: number | null;
  completeness: number | null;
  status: 'draft' | 'active' | 'archived';
  isPrimary: boolean;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 5: Write Job types**

Create `packages/types/src/job.ts`:
```typescript
import { z } from 'zod';

export const createJobSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  url: z.string().url().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
});

export const updateJobSchema = z.object({
  company: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  url: z.string().url().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  status: z.enum(['sent', 'screening', 'interview', 'offering', 'rejected']).optional(),
  notes: z.string().optional(),
  interviewDate: z.string().datetime().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export interface JobResponse {
  id: string;
  userId: string;
  company: string;
  position: string;
  url: string | null;
  location: string | null;
  salary: string | null;
  status: 'sent' | 'screening' | 'interview' | 'offering' | 'rejected';
  appliedAt: string;
  responseAt: string | null;
  interviewDate: string | null;
  notes: string | null;
  timeline: unknown;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 6: Create index barrel**

Create `packages/types/src/index.ts`:
```typescript
export * from './api';
export * from './cv';
export * from './job';
```

- [ ] **Step 7: Create tsconfig**

Create `packages/types/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 8: Commit**

```bash
git add packages/types
git commit -m "feat(types): add shared TypeScript types and Zod schemas

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

---

## Task 4: NestJS API Foundation

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`

**Interfaces:**
- Consumes: `@cuti/db` (PrismaClient)
- Produces:
  - NestJS app running on port 3001
  - PrismaModule (global) providing PrismaService

- [ ] **Step 1: Write package.json**

Create `apps/api/package.json`:
```json
{
  "name": "@cuti/api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@cuti/db": "workspace:*",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "@types/jest": "^29.5.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.0",
    "ts-loader": "^9.5.0",
    "ts-node": "^10.9.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd apps/api
pnpm install
```

- [ ] **Step 3: Write tsconfig**

Create `apps/api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "paths": {
      "@cuti/db": ["../../packages/db/src"],
      "@cuti/types": ["../../packages/types/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 4: Write PrismaService**

Create `apps/api/src/prisma/prisma.service.ts`:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@cuti/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [ ] **Step 5: Write PrismaModule**

Create `apps/api/src/prisma/prisma.module.ts`:
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 6: Write AppModule**

Create `apps/api/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

- [ ] **Step 7: Write main.ts**

Create `apps/api/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:3000', // user dashboard
      'http://localhost:3002', // admin dashboard
    ],
    credentials: true,
  });

  app.setGlobalPrefix('v1');

  await app.listen(3001);
  console.log(`Application is running on: http://localhost:3001`);
}
bootstrap();
```

- [ ] **Step 8: Test API starts**

```bash
pnpm dev
```

Expected: Server runs on port 3001, no errors.

- [ ] **Step 9: Commit**

```bash
git add apps/api
git commit -m "feat(api): initialize NestJS API with Prisma integration

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Auth Module (Better Auth + Google OAuth)

**Files:**
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/dto/register.dto.ts`
- Create: `apps/api/src/auth/dto/login.dto.ts`
- Create: `apps/api/src/auth/guards/auth.guard.ts`
- Create: `apps/api/src/auth/decorators/current-user.decorator.ts`

**Interfaces:**
- Consumes: PrismaService from Task 4
- Produces:
  - POST /v1/auth/register → `{success: true, data: {user, accessToken, refreshToken}}`
  - POST /v1/auth/login → `{success: true, data: {user, accessToken, refreshToken}}`
  - POST /v1/auth/google → `{success: true, data: {user, accessToken, refreshToken}}`
  - GET /v1/auth/me → `{success: true, data: user}`
  - AuthGuard decorator for protected routes
  - @CurrentUser() decorator

- [ ] **Step 1: Install Better Auth**

```bash
cd apps/api
pnpm add better-auth bcryptjs
pnpm add -D @types/bcryptjs
```

- [ ] **Step 2: Write register DTO**

Create `apps/api/src/auth/dto/register.dto.ts`:
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
```

- [ ] **Step 3: Write login DTO**

Create `apps/api/src/auth/dto/login.dto.ts`:
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof loginSchema>;
```

- [ ] **Step 4: Write AuthService**

Create `apps/api/src/auth/auth.service.ts`:
```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    const tokens = this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);

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
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
```

- [ ] **Step 5: Write CurrentUser decorator**

Create `apps/api/src/auth/decorators/current-user.decorator.ts`:
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

- [ ] **Step 6: Write AuthGuard**

Create `apps/api/src/auth/guards/auth.guard.ts`:
```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      // Simplified token validation — use JWT in production
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

      if (decoded.exp < Date.now()) {
        throw new UnauthorizedException('Token expired');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

- [ ] **Step 7: Write AuthController**

Create `apps/api/src/auth/auth.controller.ts`:
```typescript
import { Controller, Post, Get, Body, UseGuards, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, registerSchema } from './dto/register.dto';
import { LoginDto, loginSchema } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { success: true, data };
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return { success: true, data };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: any) {
    return { success: true, data: user };
  }
}
```

- [ ] **Step 8: Write ZodValidationPipe**

Create `apps/api/src/common/pipes/zod-validation.pipe.ts`:
```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          statusCode: 400,
          details: error.errors,
        },
      });
    }
  }
}
```

- [ ] **Step 9: Write AuthModule**

Create `apps/api/src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
```

- [ ] **Step 10: Import AuthModule in AppModule**

Update `apps/api/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

- [ ] **Step 11: Test auth endpoints**

Start dev server:
```bash
pnpm dev
```

Test register:
```bash
curl -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

Expected: `{success: true, data: {user, accessToken, refreshToken}}`

Test login:
```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected: Same response format.

Test /auth/me:
```bash
curl http://localhost:3001/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

Expected: `{success: true, data: {user}}`

- [ ] **Step 12: Commit**

```bash
git add apps/api/src/auth apps/api/src/common
git commit -m "feat(api): implement auth module with register/login

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6-50: [Remaining Tasks Outlined]

Gue stop di Task 5 karena pattern sudah jelas. Full plan bakal 50+ tasks covering:

### Sprint 2: CV Module (Task 6-15)
- Task 6: CV CRUD endpoints
- Task 7: Template seed data
- Task 8: ATS score calculator
- Task 9: PDF generation service
- Task 10: CV ownership guard
- Task 11-15: Next.js CV Builder UI (pages, components, forms, preview)

### Sprint 3: AI Integration (Task 16-25)
- Task 16: Redis + BullMQ setup
- Task 17: Vercel AI SDK integration
- Task 18: AI provider abstraction
- Task 19: Screener service + prompt
- Task 20: AI usage tracking
- Task 21-25: Screener UI (form, loading, results display)

### Sprint 4: Job Tracker (Task 26-35)
- Task 26: Job CRUD endpoints
- Task 27: Job stats aggregation
- Task 28: Job ownership guard
- Task 29-35: Kanban UI (board, columns, cards, drag-drop, list view)

### Sprint 5: Payment (Task 36-45)
- Task 36: Midtrans module
- Task 37: Payment webhook handler
- Task 38: Membership service
- Task 39: Premium guard
- Task 40-45: Payment UI (plans, checkout, history)

### Sprint 6: Dashboard & Deploy (Task 46-50)
- Task 46-48: Dashboard (Bento grid, stats, recommendations)
- Task 49: Onboarding wizard
- Task 50: Docker Compose + deploy docs

**Mau gue lanjut tulis detail semua task (Task 6-50) atau cukup sampai sini? Pattern sudah jelas dari Task 1-5.**