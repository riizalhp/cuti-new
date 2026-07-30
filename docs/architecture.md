# CUTI — Architecture

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CUTI Ecosystem                            │
├────────────────┬────────────────┬────────────────┬───────────────┤
│ cuti-landing   │ cuti-user      │ cuti-admin     │ cuti-api      │
│ (Astro)        │ (Next.js)      │ (Next.js)      │ (NestJS)      │
│                │                │                │               │
│ - Landing page │ - Dashboard    │ - User mgmt    │ - Auth        │
│ - Job listings │ - CV Builder   │ - Campaigns    │ - CV Module   │
│ - Articles     │ - AI Tools     │ - Analytics    │ - AI Tools    │
│ - SEO pages    │ - Job Tracker  │ - Content      │ - Job Module  │
│                │ - Interview    │ - Payments     │ - Interview   │
│                │ - Campaigns    │ - Settings     │ - LinkedIn    │
│                │ - Profile      │                │ - Campaign    │
│                │                │                │ - Commission  │
│                │                │                │ - Gamification│
│                │                │                │ - Referral    │
│                │                │                │ - Payment     │
│                │                │                │ - Storage     │
├────────────────┴────────────────┴────────────────┤               │
│                    API Layer (REST)                │               │
│                    ↓                               │               │
│            ┌───────────────┐                      │               │
│            │  PostgreSQL   │                      │               │
│            │  (Prisma)     │                      │               │
│            └───────────────┘                      │               │
│            ┌───────────────┐                      │               │
│            │  Cloudflare R2│ (files)              │               │
│            └───────────────┘                      │               │
│            ┌───────────────┐                      │               │
│            │  Redis        │ (queue, cache)       │               │
│            └───────────────┘                      │               │
└───────────────────────────────────────────────────┴───────────────┘
```

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Landing Page | Astro 5 | Static, zero-JS, SEO monster |
| User Dashboard | Next.js 15 (App Router) | SSR, glassmorphism UI |
| Admin Panel | Next.js 15 (App Router) | Admin management |
| Backend API | NestJS 11 | Monolith modular REST API |
| ORM | Prisma | PostgreSQL client, migrations |
| Database | PostgreSQL 16 | Primary data store |
| Cache/Queue | Redis + BullMQ | Async AI jobs, caching |
| File Storage | Cloudflare R2 | CV PDFs, images, exports |
| Auth | Better Auth + Google OAuth | Authentication |
| AI | Vercel AI SDK (multi-provider) | OpenAI, Gemini, custom |
| Payment | Midtrans | VA, e-wallet, QRIS, CC |
| Monorepo | Turborepo + pnpm | Workspace management |
| Deployment (landing) | Vercel | Free tier, global CDN |
| Deployment (rest) | Sumopod VPS | User dashboard, admin, API |

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                  Cloudflare                       │
│  ┌──────────────┐                                │
│  │ R2 Storage   │ ← CV PDFs, avatars, exports    │
│  └──────────────┘                                │
│  ┌──────────────┐                                │
│  │ CDN          │ ← Landing page assets          │
│  └──────────────┘                                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                  Vercel (Free)                    │
│  ┌──────────────┐                                │
│  │ cuti-landing │ ← Astro static site            │
│  │ (astro)      │                                │
│  └──────────────┘                                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                Sumopod VPS                        │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ cuti-user    │  │ cuti-admin   │              │
│  │ (next.js)    │  │ (next.js)    │              │
│  └──────┬───────┘  └──────┬───────┘              │
│         └─────────┬────────┘                      │
│           ┌───────┴───────┐                      │
│           │   cuti-api    │ ← NestJS              │
│           │   (nestjs)    │                       │
│           └───────┬───────┘                      │
│    ┌──────────────┼──────────────┐               │
│    ▼              ▼              ▼               │
│ ┌──────┐    ┌──────────┐    ┌────────┐          │
│ │Postgr│    │ Redis    │    │ Better │          │
│ │SQL   │    │ (BullMQ) │    │ Auth   │          │
│ └──────┘    └──────────┘    └────────┘          │
└─────────────────────────────────────────────────┘
```

## Monorepo Structure (Turborepo)

```
cuti/
├── apps/
│   ├── api/                  ← NestJS backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── cv/
│   │   │   │   ├── ai-tools/
│   │   │   │   ├── job/
│   │   │   │   ├── interview/
│   │   │   │   ├── linkedin/
│   │   │   │   ├── campaign/
│   │   │   │   ├── gamification/
│   │   │   │   ├── referral/
│   │   │   │   ├── readiness/
│   │   │   │   ├── payment/
│   │   │   │   ├── storage/
│   │   │   │   ├── email/
│   │   │   │   ├── notification/
│   │   │   │   └── content/
│   │   │   ├── shared/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── filters/
│   │   │   │   ├── decorators/
│   │   │   │   └── utils/
│   │   │   └── prisma/
│   │   │       ├── schema.prisma
│   │   │       └── migrations/
│   │   └── package.json
│   │
│   ├── user/                 ← Next.js user dashboard
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   ├── (dashboard)/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/       ← shadcn + glass components
│   │   │   │   └── features/ ← feature-specific components
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   ├── admin/                ← Next.js admin panel
│   │   ├── src/
│   │   └── package.json
│   │
│   └── landing/              ← Astro landing
│       ├── src/
│       └── package.json
│
├── packages/
│   ├── ui/                   ← Shared glassmorphism components
│   │   ├── src/
│   │   │   ├── glass-card.tsx
│   │   │   ├── glass-navbar.tsx
│   │   │   ├── glass-input.tsx
│   │   │   ├── button.tsx
│   │   │   ├── bento-grid.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── db/                   ← Prisma schema + client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── config/               ← Shared configs
│   │   ├── eslint/
│   │   ├── tailwind/
│   │   └── tsconfig/
│   │
│   └── types/                ← Shared TypeScript types
│       ├── src/
│       │   ├── api.ts
│       │   ├── cv.ts
│       │   ├── user.ts
│       │   └── index.ts
│       └── package.json
│
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── .env.example
```

## NestJS Module Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     NestJS Application                    │
├─────────────────────────────────────────────────────────┤
│  Middleware Layer                                         │
│  ├── CORS                                                 │
│  ├── Helmet (security headers)                            │
│  ├── Rate Limiter (throttler)                             │
│  └── Request Logger                                       │
│                                                          │
│  Guard Layer                                              │
│  ├── Better Auth Guard (JWT verification)                 │
│  ├── Role Guard (free/premium/admin)                      │
│  └── Ownership Guard (user owns resource)                 │
│                                                          │
│  Module Layer                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │Auth    │ │CV      │ │AI      │ │Job     │           │
│  │Module  │ │Module  │ │Tools   │ │Module  │           │
│  │        │ │(hub)   │ │Module  │ │        │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │Inter-  │ │Linkedin│ │Campaign│ │Gamifi- │           │
│  │view    │ │Module  │ │Module  │ │cation  │           │
│  │Module  │ │        │ │        │ │Module  │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │Referral│ │Readiness│ │Payment│ │Notif   │           │
│  │Module  │ │Module  │ │Module │ │Module  │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│                                                          │
│  Infrastructure Layer                                     │
│  ├── PrismaModule (database)                              │
│  ├── RedisModule (cache + queue)                          │
│  ├── BullModule (job queue)                               │
│  ├── R2Module (Cloudflare R2 storage)                     │
│  └── AIModule (Vercel AI SDK, multi-provider)             │
│                                                          │
│  Exception Filter (global)                                │
│  └── Catches all exceptions, returns unified error format │
└─────────────────────────────────────────────────────────┘
```

### Module Pattern
```
cv/
├── cv.module.ts           ← Module definition
├── cv.controller.ts       ← HTTP layer (routes, validation, guards)
├── cv.service.ts          ← Business logic
├── cv.repository.ts       ← Prisma data access
├── dto/
│   ├── create-cv.dto.ts   ← Zod schema
│   ├── update-cv.dto.ts
│   └── cv-response.dto.ts
├── guards/
│   └── cv-owner.guard.ts
└── __tests__/
```

## AI Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI Service Layer                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Feature Services                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Screener  │ │ATS Match │ │Cover     │ │Interview │  │
│  │Service   │ │Service   │ │Letter    │ │Evaluator │  │
│  │          │ │          │ │Service   │ │          │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       └─────────────┴─────────────┴─────────────┘       │
│                         ▼                                │
│              ┌──────────────────┐                        │
│              │  Provider Router │ (admin-configured)     │
│              └────────┬─────────┘                        │
│                       ▼                                  │
│              ┌──────────────────┐                        │
│              │  Vercel AI SDK   │ (abstraction layer)    │
│              └────────┬─────────┘                        │
│         ┌─────────────┼─────────────┐                   │
│         ▼             ▼             ▼                   │
│    ┌─────────┐  ┌─────────┐  ┌──────────┐              │
│    │ OpenAI  │  │ Gemini  │  │ Custom   │              │
│    │ GPT-4o  │  │         │  │ (OAI-    │              │
│    │         │  │         │  │ compat)  │              │
│    └─────────┘  └─────────┘  └──────────┘              │
│                                                          │
│  Queue Layer                                             │
│  ┌──────────────────┐                                    │
│  │ BullMQ (Redis)    │ ← All AI calls async              │
│  │ - Retry on fail   │                                    │
│  │ - Rate limiting   │                                    │
│  │ - Progress track  │                                    │
│  └──────────────────┘                                    │
│                                                          │
│  Tracking                                                │
│  ┌──────────────────┐                                    │
│  │ AI Usage Log      │ ← provider, model, tokens, cost   │
│  └──────────────────┘                                    │
│                                                          │
│  BYOK (Bring Your Own Key)                               │
│  ┌──────────────────┐                                    │
│  │ User API Key Store│ ← Encrypted, per-user optional    │
│  └──────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

## Cross-Module Data Flow

CV Module jadi data hub — module lain akses data profesional user via CV Service injection:

```
         ┌─────────────┐
         │  CV Module   │ ← Central data hub
         │  (profiles,  │
         │   resumes)   │
         └──────┬───────┘
                │
    ┌───────────┼───────────┬───────────┐
    ▼           ▼           ▼           ▼
┌───────┐ ┌────────┐ ┌──────────┐ ┌─────────┐
│AI     │ │Job     │ │Interview │ │LinkedIn │
│Tools  │ │Tracker │ │Center    │ │Optimizer│
│       │ │        │ │          │ │         │
│Reads  │ │Reads   │ │Reads     │ │Reads    │
│CV data│ │CV data │ │CV data   │ │CV data  │
│for    │ │for     │ │for       │ │for      │
│screen │ │match   │ │question  │ │profile  │
│-ing   │ │-ing    │ │gen       │ │analysis │
└───────┘ └────────┘ └──────────┘ └─────────┘
```

Key rule: Module lain INJECT CV Service, query via method. Bukan direct DB access.
