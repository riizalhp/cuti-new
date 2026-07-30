# AmbilCUTI Full MVP Implementation Plan

> **For Hermes:** Use this plan to implement the complete MVP from current state (~40%) to production-ready.

**Goal:** Take AmbilCUTI from mock data to fully functional production app with real backend, payment, email, and AI processing.

**Architecture:** Next.js monorepo (Turborepo) + Prisma + PostgreSQL (Docker) + Redis + BullMQ + SeaweedFS + OpenAI-compatible API + Midtrans + Resend.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Redis, BullMQ, SeaweedFS, Midtrans, Resend, shadcn/ui, lucide-react, @dnd-kit/core.

---

## Current State

| Component | Status |
|---|---|
| Monorepo structure | ✅ Done |
| 4 Apps (dashboard, marketplace, admin, web) | ✅ Done |
| 8 Packages (db, ui, ai, auth, queue, storage, config, validators) | ✅ Done |
| Prisma schema (25+ tables) | ✅ Done |
| UI/Design system | ✅ Done (~95%) |
| Mock data | ⚠️ All pages use mock data |
| AI provider | ⚠️ Single provider (OpenAI only) |
| Kanban drag-drop | ⚠️ Visual only |
| Database connection | ❌ Not connected |
| Payment (Midtrans) | ❌ Not integrated |
| Email (Resend) | ❌ Not integrated |
| Landing page | ❌ Not built |

---

## Phase 0: Infrastructure Setup

### Task 0.1: Docker Compose for Local Development

**Objective:** Set up local development environment with PostgreSQL, Redis, and SeaweedFS.

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.local` (template)

**Steps:**

1. Create `docker-compose.yml` with:
   - PostgreSQL 16 (port 5432)
   - Redis 7 (port 6379)
   - SeaweedFS (port 9333, 8080)

2. Create `.env.local` template:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/ambilcuti"

# Redis
REDIS_URL="redis://localhost:6379"

# SeaweedFS
SEAWEED_MASTER="localhost:9333"
SEAWEED_FILER="localhost:8080"

# AI (OpenAI-compatible)
AI_BASE_URL="http://localhost:11434/v1"
AI_API_KEY="your-api-key"
AI_DEFAULT_MODEL="gpt-4o-mini"

# Midtrans
MIDTRANS_SERVER_KEY="your-server-key"
MIDTRANS_CLIENT_KEY="your-client-key"
MIDTRANS_IS_PRODUCTION=false

# Resend
RESEND_API_KEY="your-resend-key"
RESEND_FROM_EMAIL="noreply@ambilcuti.id"

# Auth
AUTH_SECRET="generate-a-secret-here"
```

3. Run `docker-compose up -d`

**Verification:**
```bash
docker-compose ps
# All 3 services should be "Up"
```

---

### Task 0.2: Prisma Generate & Migration

**Objective:** Generate Prisma client and create database tables.

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (if needed)
- Create: `packages/db/prisma/migrations/` (auto-generated)

**Steps:**

1. Navigate to `packages/db`
2. Run `npx prisma generate`
3. Run `npx prisma db push` (for development) or `npx prisma migrate dev` (for production)

**Verification:**
```bash
cd packages/db
npx prisma studio
# Should open browser with all tables visible
```

---

### Task 0.3: Environment Config Package

**Objective:** Update config package to read from database (for AI providers) + env variables.

**Files:**
- Modify: `packages/config/src/index.ts`

**Steps:**

1. Update env schema to include all required variables
2. Add validation using Zod
3. Export typed config object

---

## Phase 1: AI Multi-Provider System

### Task 1.1: AI Provider Database Table

**Objective:** Add AI provider settings table to Prisma schema.

**Files:**
- Modify: `packages/db/prisma/schema.prisma`

**Steps:**

1. Add `AiProvider` model:
```prisma
model AiProvider {
  id            String   @id @default(uuid()) @db.Uuid
  name          String
  baseUrl       String   @map("base_url")
  apiKey        String   @map("api_key")
  model         String
  isActive      Boolean  @default(true) @map("is_active")
  priority      Int      @default(0)
  rpmLimit      Int      @default(60) @map("rpm_limit")
  tpmLimit      Int      @default(90000) @map("tpm_limit")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("ai_providers")
}
```

2. Run migration

---

### Task 1.2: Multi-Provider Router

**Objective:** Build AI provider router with fallback, rate limiting, and admin configuration.

**Files:**
- Modify: `packages/ai/src/key-manager.ts`
- Modify: `packages/ai/src/index.ts`
- Create: `packages/ai/src/router.ts`

**Steps:**

1. Create `AIProviderRouter` class:
   - Load providers from database
   - Priority-based selection
   - Automatic fallback on failure
   - Rate limit tracking (RPM/TPM)
   - Cooldown on rate limit

2. Update exports

**Verification:**
```bash
# Should be able to call router with any provider
const router = new AIProviderRouter();
const client = await router.getClient();
```

---

### Task 1.3: Admin AI Provider Settings Page

**Objective:** Build admin page to manage AI providers.

**Files:**
- Create: `apps/admin/src/app/ai-settings/page.tsx`
- Create: `apps/admin/src/components/AiProviderForm.tsx`

**Steps:**

1. Build form with fields:
   - Name (e.g., "ServerNusa", "OpenRouter")
   - Base URL
   - API Key (masked display)
   - Model name
   - Priority (1-10)
   - RPM Limit
   - Active toggle

2. Build list view showing all providers
3. Add CRUD operations via API routes

---

## Phase 2: Core Features - CV Builder

### Task 2.1: CV Project API Routes

**Objective:** Create API routes for CV project CRUD.

**Files:**
- Create: `apps/dashboard/src/app/api/cv/route.ts`
- Create: `apps/dashboard/src/app/api/cv/[id]/route.ts`

**Steps:**

1. GET `/api/cv` - List user's CV projects
2. POST `/api/cv` - Create new CV project
3. GET `/api/cv/[id]` - Get CV project detail
4. PUT `/api/cv/[id]` - Update CV project
5. DELETE `/api/cv/[id]` - Delete CV project

---

### Task 2.2: CV Wizard - Connect to Real Data

**Objective:** Connect CV wizard to database.

**Files:**
- Modify: `apps/dashboard/src/app/buat-cv/page.tsx`
- Create: `apps/dashboard/src/components/cv-wizard/` (wizard components)

**Steps:**

1. Create wizard state management (Zustand)
2. Connect step 1 (Upload CV) to SeaweedFS
3. Connect step 2-6 to form state
4. Connect step 7 (submit) to API route
5. Handle draft persistence

---

### Task 2.3: CV AI Processing Worker

**Objective:** Build worker that processes CV with AI.

**Files:**
- Modify: `packages/queue/src/queues/ai.queue.ts`
- Create: `packages/worker/src/processors/cv.processor.ts`

**Steps:**

1. Create CV processor that:
   - Receives CV project ID
   - Loads CV data from database
   - Calls AI with structured prompt
   - Updates CV sections
   - Marks project as READY

2. Implement prompt templates for each CV section
3. Add error handling and retry logic

---

### Task 2.4: CV Preview & Download

**Objective:** Build CV preview and PDF download.

**Files:**
- Create: `apps/dashboard/src/app/cv/[id]/page.tsx`
- Create: `apps/dashboard/src/components/cv-preview/`

**Steps:**

1. Build CV preview component (A4 ratio)
2. Implement PDF generation using `@react-pdf/renderer`
3. Add download button
4. Implement print stylesheet

---

## Phase 3: Tracker with Drag-Drop

### Task 3.1: Install @dnd-kit

**Objective:** Add drag-and-drop library.

**Files:**
- Modify: `apps/dashboard/package.json`

**Steps:**

```bash
cd apps/dashboard
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

### Task 3.2: Kanban Board with Drag-Drop

**Objective:** Implement drag-and-drop kanban board.

**Files:**
- Modify: `apps/dashboard/src/app/tracker/page.tsx`
- Create: `apps/dashboard/src/components/kanban/`

**Steps:**

1. Create `KanbanBoard` component with DndContext
2. Create `KanbanColumn` component
3. Create `KanbanCard` component (draggable)
4. Implement `onDragEnd` handler to update status
5. Add optimistic UI updates
6. Persist to database via API

---

### Task 3.3: Tracker API Routes

**Objective:** Create API routes for application tracking.

**Files:**
- Create: `apps/dashboard/src/app/api/applications/route.ts`
- Create: `apps/dashboard/src/app/api/applications/[id]/route.ts`

**Steps:**

1. GET `/api/applications` - List with filters
2. POST `/api/applications` - Create new application
3. PATCH `/api/applications/[id]` - Update status
4. DELETE `/api/applications/[id]` - Delete application

---

## Phase 4: Payment Integration

### Task 4.1: Midtrans Integration

**Objective:** Integrate Midtrans payment gateway.

**Files:**
- Create: `packages/payment/src/midtrans.ts`
- Create: `packages/payment/src/index.ts`
- Create: `apps/dashboard/src/app/api/payment/route.ts`

**Steps:**

1. Install Midtrans SDK
2. Create payment client with snap token generation
3. Create API route for creating payment
4. Create API route for handling callbacks

---

### Task 4.2: Order Flow

**Objective:** Implement complete order flow.

**Files:**
- Create: `apps/dashboard/src/app/api/orders/route.ts`
- Modify: `apps/dashboard/src/app/checkout/page.tsx`

**Steps:**

1. Create order API route
2. Connect checkout page to API
3. Implement payment modal (Midtrans Snap)
4. Handle payment success/failure
5. Update order status on callback

---

### Task 4.3: CV Unlock Flow

**Objective:** Unlock CV after payment.

**Files:**
- Modify: `packages/queue/src/queues/unlock.queue.ts`

**Steps:**

1. Create unlock processor that:
   - Receives order ID
   - Updates CV status to PROCESSING
   - Adds to AI queue
   - Updates membership tier

---

## Phase 5: Email Notifications

### Task 5.1: Resend Integration

**Objective:** Set up Resend email service.

**Files:**
- Create: `packages/email/src/client.ts`
- Create: `packages/email/src/index.ts`

**Steps:**

1. Create Resend client
2. Create email templates:
   - Order confirmation
   - CV ready notification
   - Referral reward notification
   - Welcome email

---

### Task 5.2: Email Worker

**Objective:** Send emails asynchronously.

**Files:**
- Modify: `packages/queue/src/queues/notification.queue.ts`
- Create: `packages/worker/src/processors/email.processor.ts`

**Steps:**

1. Create email processor
2. Queue emails on events:
   - Order created → confirmation email
   - CV ready → notification email
   - Referral rewarded → reward email

---

### Task 5.3: Email Templates

**Objective:** Design email templates.

**Files:**
- Create: `packages/email/templates/`

**Steps:**

1. Create base email layout
2. Create order confirmation template
3. Create CV ready template
4. Create referral reward template
5. Create welcome template

---

## Phase 6: Referral System

### Task 6.1: Referral API Routes

**Objective:** Build referral tracking API.

**Files:**
- Create: `apps/dashboard/src/app/api/referral/route.ts`

**Steps:**

1. GET `/api/referral` - Get referral stats
2. POST `/api/referral/claim` - Claim referral reward
3. GET `/api/referral/history` - Get referral history

---

### Task 6.2: Tiered Referral Rewards

**Objective:** Implement generous tiered rewards.

**Files:**
- Modify: `packages/validators/src/index.ts` (referral rules)

**Steps:**

1. Implement reward tiers:
   - 1-5 referrals: Rp1,000 per referral
   - 6-15 referrals: Rp2,500 per referral
   - 16-30 referrals: Rp5,000 per referral
   - 31+ referrals: Rp15,000 per referral

2. Implement milestone bonuses:
   - 10 active: Rp25,000
   - 25 active: Rp75,000
   - 50 active: Rp200,000
   - 100 active: Rp500,000

3. Implement dual-sided rewards (referrer + referee)

---

### Task 6.3: Referral Dashboard

**Objective:** Build referral dashboard UI.

**Files:**
- Modify: `apps/dashboard/src/app/referral/page.tsx`

**Steps:**

1. Display referral code with copy button
2. Show referral stats (total, active, earned)
3. Show tier progress
4. Show withdrawal history
5. Add share buttons (WhatsApp, Instagram, etc.)

---

## Phase 7: Marketplace & SEO

### Task 7.1: Marketplace API Routes

**Objective:** Build marketplace API for jobs.

**Files:**
- Create: `apps/marketplace/src/app/api/jobs/route.ts`

**Steps:**

1. GET `/api/jobs` - List jobs with filters
2. GET `/api/jobs/[id]` - Get job detail
3. Implement pagination
4. Implement search

---

### Task 7.2: SEO Pages

**Objective:** Generate 15,000+ SEO pages.

**Files:**
- Create: `apps/marketplace/src/app/[category]/[location]/page.tsx`
- Create: `apps/marketplace/src/lib/seo.ts`

**Steps:**

1. Create dynamic route for job listings
2. Implement `generateStaticParams` for static generation
3. Add structured data (JSON-LD)
4. Add meta tags
5. Create sitemap generation

---

### Task 7.3: Landing Page

**Objective:** Build landing page for ambilcuti.id.

**Files:**
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/components/`

**Steps:**

1. Build hero section
2. Build features section (Bento grid)
3. Build how it works section
4. Build pricing section
5. Build testimonials section
6. Build FAQ section
7. Build CTA section
8. Build footer

---

## Phase 8: Polish & Testing

### Task 8.1: Error Handling

**Objective:** Add comprehensive error handling.

**Files:**
- Create: `apps/dashboard/src/app/error.tsx`
- Create: `apps/dashboard/src/app/not-found.tsx`
- Create: `packages/ui/src/components/error-boundary.tsx`

**Steps:**

1. Create error boundary component
2. Create error pages (404, 500)
3. Add toast notifications for errors
4. Add loading states

---

### Task 8.2: Loading States

**Objective:** Add skeleton loading states.

**Files:**
- Create: `packages/ui/src/components/skeletons/`

**Steps:**

1. Create skeleton components for:
   - Dashboard widgets
   - Job cards
   - CV preview
   - Kanban board

---

### Task 8.3: Mobile Optimization

**Objective:** Ensure mobile-first experience.

**Files:**
- Modify: Various component files

**Steps:**

1. Test all pages on mobile viewport
2. Fix any overflow issues
3. Optimize touch targets (44px minimum)
4. Add safe area padding for notch devices

---

## Phase 9: Deployment

### Task 9.1: Vercel Deployment

**Objective:** Deploy to Vercel.

**Files:**
- Create: `vercel.json`
- Create: `turbo.json` (update if needed)

**Steps:**

1. Connect GitHub repo to Vercel
2. Configure environment variables
3. Set up preview deployments
4. Configure custom domains

---

### Task 9.2: Database Migration

**Objective:** Set up production database.

**Files:**
- Create: `packages/db/prisma/migrations/`

**Steps:**

1. Set up Supabase or Neon
2. Run migrations
3. Seed initial data

---

### Task 9.3: Monitoring

**Objective:** Set up monitoring.

**Files:**
- Create: `apps/admin/src/app/monitoring/page.tsx`

**Steps:**

1. Add health check endpoint
2. Add queue monitoring
3. Add error tracking (Sentry)
4. Add analytics (optional)

---

## Execution Order

| Phase | Tasks | Est. Time |
|---|---|---|
| **Phase 0** | Infrastructure | 1-2 hours |
| **Phase 1** | AI System | 3-4 hours |
| **Phase 2** | CV Builder | 4-6 hours |
| **Phase 3** | Tracker | 2-3 hours |
| **Phase 4** | Payment | 2-3 hours |
| **Phase 5** | Email | 2-3 hours |
| **Phase 6** | Referral | 2-3 hours |
| **Phase 7** | Marketplace & SEO | 4-6 hours |
| **Phase 8** | Polish | 2-3 hours |
| **Phase 9** | Deployment | 2-3 hours |
| **Total** | | **24-35 hours** |

---

## Verification Checklist

After each phase, verify:

- [ ] All features work as expected
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Loading states present
- [ ] Error handling in place
- [ ] API routes protected (auth)
- [ ] Database queries optimized

---

## Notes

1. **Mock data removal:** Replace all mock data with real database queries
2. **AI terminology:** Never expose "AI", "GPT", "LLM" to users. Use "Disusun", "Diproses", "Dianalisis"
3. **Design consistency:** Follow the navy+orange design system
4. **Mobile-first:** Test on 375px viewport minimum
5. **Performance:** Optimize images, lazy load components

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| API rate limits | Multi-provider fallback |
| Payment failures | Retry logic + manual admin override |
| Email delivery | Queue + retry + admin notification |
| Database performance | Indexes + connection pooling |
| AI costs | Model selection (gpt-4o-mini for most tasks) |

---

*Last updated: 2026-06-27*
