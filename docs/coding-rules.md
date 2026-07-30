# CUTI — Coding Rules

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | NestJS 11 + Prisma + PostgreSQL |
| User Dashboard | Next.js 15 (App Router) + Tailwind CSS + shadcn/ui |
| Admin Panel | Next.js 15 (App Router) + Tailwind CSS + shadcn/ui |
| Landing Page | Astro 5 + Tailwind CSS |
| Monorepo | Turborepo + pnpm |
| Auth | Better Auth + Google OAuth |
| AI | Vercel AI SDK (multi-provider) |
| Cache/Queue | Redis + BullMQ |
| File Storage | Cloudflare R2 |
| Payment | Midtrans |
| Animations | Framer Motion + Lenis |
| Deployment (landing) | Vercel |
| Deployment (rest) | Sumopod VPS |

## NestJS Module Pattern

```
modules/cv/
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

**Rules:**
1. Controller = HTTP only (parse request, call service, return response)
2. Service = business logic only (no HTTP concerns)
3. Repository = Prisma queries only (no business logic)
4. DTOs use Zod schemas — auto-generate TypeScript types
5. Guards for auth + ownership checks
6. Each module exports service for cross-module injection

## Next.js App Router Pattern

```
app/(dashboard)/cv/
├── page.tsx                 ← Server component (data fetching)
├── loading.tsx              ← Suspense fallback
├── error.tsx                ← Error boundary
├── components/
│   ├── cv-list.tsx          ← Client component (interactions)
│   ├── cv-card.tsx          ← Presentational component
│   └── cv-filters.tsx       ← Filter controls
└── _actions/
    └── cv.actions.ts        ← Server actions
```

**Rules:**
1. Pages = server components by default
2. Client components only when needed (interactions, state, effects)
3. Server actions for mutations (not API route handlers)
4. Loading + error states for every page
5. Data fetching in server components via service layer

## TypeScript Rules

```typescript
// Strict mode always
"strict": true

// No any — ever
// No type assertions unless unavoidable (with comment explaining why)

// Prefer interfaces for object shapes
interface CreateCvInput {
  title: string;
  personalInfo: PersonalInfo;
  experiences: Experience[];
}

// Enums as const objects (not TypeScript enum)
const CV_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;
type CvStatus = (typeof CV_STATUS)[keyof typeof CV_STATUS];
```

## Error Handling

```typescript
// Custom exception classes
class CvNotFoundException extends NotFoundException {
  constructor(cvId: string) {
    super(`CV with id ${cvId} not found`);
  }
}

// Global exception filter catches all
// Service throws domain exceptions
// Controller doesn't catch — let filter handle

// Frontend: try/catch server actions, show toast on error
```

## Validation

```typescript
// Backend: Zod schemas for all inputs
const createCvSchema = z.object({
  title: z.string().min(1).max(100),
  personalInfo: personalInfoSchema,
  experiences: z.array(experienceSchema).optional(),
});

// Frontend: same Zod schemas shared via packages/types
// react-hook-form + zod resolver for forms
```

## API Communication

```typescript
// Frontend: typed API client
const api = {
  cv: {
    list: () => fetcher<CV[]>('/cv'),
    create: (data: CreateCvInput) => post<CV>('/cv', data),
    get: (id: string) => fetcher<CV>(`/cv/${id}`),
  }
};

// Shared types from packages/types ensure frontend-backend contract
```

## AI Service Pattern

```
modules/ai-tools/
├── providers/
│   ├── ai-provider.interface.ts    ← Abstract interface
│   ├── openai.provider.ts
│   ├── gemini.provider.ts
│   └── provider.factory.ts         ← Pick provider per feature
├── features/
│   ├── screener.service.ts
│   ├── ats-match.service.ts
│   └── cover-letter.service.ts
└── queue/
    ├── ai.processor.ts             ← BullMQ processor
    └── ai.queue.ts                 ← Queue definition
```

**Rules:**
1. AI calls via BullMQ queue (async, retry, rate limit)
2. Provider abstraction — switch via admin config
3. Record every AI call: provider, model, tokens, cost
4. Rate limit per user tier
5. Cache common analyses

## Security Rules

1. Better Auth handles: session, JWT, OAuth, CSRF
2. All API routes require auth except: /auth/*, /health, /payment/callback
3. Ownership guards: user can only access own resources
4. Rate limiting: 100 req/min general, 10 req/min AI endpoints
5. Input validation: Zod on all inputs, sanitize HTML
6. File upload: max 5MB, type whitelist (PDF, PNG, JPG)
7. Payment webhook: verify Midtrans signature
8. CORS: only allow frontend domains
9. Helmet: security headers
10. Env vars: never commit, use .env with Zod validation

## Testing Rules

**Backend:**
- Unit tests: service logic (mock repository)
- Integration tests: controller + service + real DB (test DB)
- E2E tests: full API flow per critical path
- Coverage: 70% services, 80% critical paths (auth, payment)

**Frontend:**
- Component tests: key UI components (Testing Library)
- E2E tests: critical user flows (Playwright)
- Coverage target: not mandatory for MVP

## Git Rules

**Branch strategy:**
```
main          ← Production
develop       ← Staging
feat/*        ← Feature branches
fix/*         ← Bug fix branches
hotfix/*      ← Production hotfixes
```

**Commit convention:**
```
feat: new feature
fix: bug fix
refactor: code change (no behavior change)
style: formatting
test: adding tests
docs: documentation
chore: build, dependencies
perf: performance improvement
```

**PR rules:**
- 1 approval minimum
- All tests pass
- No merge conflicts
- Squash merge to develop
