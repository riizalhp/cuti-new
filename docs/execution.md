# CUTI — Execution Plan

## Development Approach

Solo developer, bootstrap budget. Build iteratively: MVP → feedback → expand.

## Phase 1 Execution Detail

### Sprint 1 (Week 1-2): Project Foundation

**Day 1-2: Monorepo Setup**
```bash
# Init Turborepo + pnpm
pnpm create turbo@latest cuti
cd cuti

# Setup apps
pnpm dlx create-next-app@latest apps/user --typescript --tailwind --app
pnpm dlx create-next-app@latest apps/admin --typescript --tailwind --app
pnpm create astro@latest apps/landing
nest new apps/api

# Setup packages
mkdir packages/{ui,db,types,config}
```

**Day 3-4: Database + Auth**
```bash
# Prisma setup
cd packages/db
pnpm add prisma @prisma/client
npx prisma init

# Install Better Auth
cd apps/api
pnpm add better-auth

# Google OAuth setup in Google Cloud Console
```

**Day 5-7: NestJS Modules Setup**
- AuthModule (Better Auth + Google OAuth)
- PrismaModule (global)
- HealthModule
- Shared guards, interceptors, filters

**Day 8-10: Frontend Foundation**
- Glassmorphism design tokens (Tailwind config)
- Shared glass components (packages/ui)
- Auth pages (login, register)
- Dashboard layout (sidebar + navbar)

### Sprint 2 (Week 3-4): CV Module

**Day 1-3: CV Backend**
- CV CRUD endpoints
- CV data schema (JSON fields)
- Template model + seed data
- PDF generation service (Puppeteer)

**Day 4-6: CV Builder UI**
- Real-time A4 preview component
- Section editors (accordion/tab layout)
- Template selector
- Download PDF button

**Day 7-8: ATS Score**
- Keyword extraction algorithm
- Completeness calculator
- Score display component

**Day 9-10: CV List + Template Gallery**
- CV list page (cards with ATS score)
- Template gallery page
- Search & filter

### Sprint 3 (Week 5-6): AI Integration

**Day 1-2: AI Infrastructure**
- Vercel AI SDK setup
- Provider abstraction (OpenAI + custom endpoint)
- BullMQ queue + Redis setup
- AI usage logging

**Day 3-5: AI CV Screener**
- Screener service (prompt engineering)
- Screener UI (form → loading → results)
- Result display (ATS score, keywords, red flags, recommendations)

**Day 6-7: Rate Limiting + Gating**
- Free tier: 1x trial screening
- Premium: unlimited
- Token-based rate limiter

**Day 8-10: Testing + Polish**
- Unit tests for CV service
- Integration tests for AI screener
- Error handling polish

### Sprint 4 (Week 7-8): Job Tracker

**Day 1-3: Job Backend**
- JobApplication CRUD
- Status management
- Stats aggregation queries

**Day 4-6: Kanban Board**
- Drag & drop column layout
- Status change on drop
- Card component

**Day 7-8: List View + Stats**
- Table view alternative
- Pipeline statistics chart

**Day 9-10: Polish**
- Timeline view
- Interview date reminders

### Sprint 5 (Week 9-10): Payment

**Day 1-3: Midtrans Integration**
- Payment module (create, callback, status)
- Midtrans Snap integration
- Webhook handler (signature verification)

**Day 4-5: Membership Flow**
- Plan selection page
- Subscription management
- Auto-renew logic

**Day 6-7: Feature Gating**
- Premium guard (NestJS)
- Premium check (frontend)
- Upgrade prompts for free users

**Day 8-10: Payment History + Polish**
- Payment history page
- Invoice generation
- Edge case handling

### Sprint 6 (Week 11-12): Dashboard + Deploy

**Day 1-3: Dashboard**
- Bento grid layout
- Welcome card
- Stats cards (lamaran, ATS, readiness)
- Lowongan rekomendasi
- Daily mission placeholder

**Day 4-5: Onboarding**
- 4-step wizard
- Profile completion tracking

**Day 6-7: Landing Page**
- Hero section
- Features showcase
- Pricing section
- CTA

**Day 8-10: Deploy + Test**
- Docker Compose setup
- Deploy to Sumopod VPS
- Deploy landing to Vercel
- E2E testing (critical paths)
- Bug fixes
- Launch preparation

---

## Environment Setup

### .env Structure
```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Auth
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI (OpenAI-compatible: endpoint + API key)
AI_ENDPOINT=https://api.openai.com/v1
AI_API_KEY=
AI_MODEL=gpt-4o-mini

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# App
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USER_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002
```

### Docker Compose (Development)
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: cuti
      POSTGRES_USER: cuti
      POSTGRES_PASSWORD: cuti
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## Risk Mitigation

| Risk | Mitigation | Owner |
|------|-----------|-------|
| AI cost overrun | Tiered usage, cache, monitor per-user cost | Dev |
| Scope creep | Strict phased approach, MVP first | Dev |
| Low user adoption | Strong free tier hooks, referral program | Dev + Marketing |
| VPS downtime | Health checks, auto-restart, monitoring | Dev |
| Payment issues | Midtrans sandbox testing, manual verification fallback | Dev |
| Security breach | Auth guards, input validation, rate limiting, regular dependency updates | Dev |
