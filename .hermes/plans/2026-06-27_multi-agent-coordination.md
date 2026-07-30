# Multi-Agent Coordination Plan

## Agent Setup

```
┌─────────────────────────────────────────────────────────────┐
│                 SAYA (Senior Dev / PM)                       │
│  - Arsitektur                                                │
│  - Code review                                               │
│  - Integration                                               │
│  - Conflict resolution                                       │
└─────────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Claude Code  │ │ OpenClaude   │ │ Subagent     │ │ Me           │
│ (Aerolink)   │ │ (DeepSeek    │ │ Hermes       │ │ (Integration)│
│              │ │  V4 Flash)   │ │ (Custom)     │ │              │
│ Backend      │ │ Flexible     │ │ Frontend     │ │ Review &     │
│ packages/*   │ │ Tasks A, C   │ │ components/* │ │ Integration  │
│ API routes   │ │ Quick fixes  │ │ pages/*      │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

## How to Run Each Agent

### 1. Claude Code CLI (Backend Focus)
```bash
# Non-interactive mode
claude -p "Your prompt here" --add-dir d:/cuti/path

# Example: Create AI provider router
claude -p "Create packages/ai/src/router.ts with multi-provider router..." --add-dir d:/cuti/packages/ai
```

### 2. OpenClaude CLI (Flexible/Quick Tasks)
```bash
# Non-interactive mode
/c/Users/LENOVO/openclaude/bin/openclaude -p "Your prompt here" --add-dir d:/cuti/path --no-session-persistence

# Example: Quick API route creation
/c/Users/LENOVO/openclaude/bin/openclaude -p "Create apps/dashboard/src/app/api/cv/route.ts..." --add-dir d:/cuti/apps/dashboard
```

### 3. Subagent Hermes (Frontend Focus)
```python
delegate_task(
    goal="Build CV wizard components",
    context="Create files in apps/dashboard/src/components/cv-wizard/",
    toolsets=['coding', 'file']
)
```

## Task Division Rules

### CRITICAL: No File Conflicts

Each agent works on **DIFFERENT files**. No overlap.

| Agent | Files Owned | Can Touch |
|---|---|---|
| **Claude Code** | `packages/*`, `apps/*/prisma/`, API routes | Backend logic only |
| **Subagent Hermes** | `apps/*/src/components/`, `apps/*/src/app/` | Frontend components only |
| **Me** | Integration, coordination, testing | Everything (for fixes) |

---

## Phase 0: Infrastructure (Me)

**I handle this alone** because it's setup, not feature code.

### Tasks:
1. Create `docker-compose.yml`
2. Create `.env.local` template
3. Run `prisma generate`
4. Run `prisma db push`
5. Verify database connection

**No agent needed** — this is 30 minutes of setup.

---

## Phase 1: AI System (Claude Code)

**Claude Code handles backend packages.**

### Task Assignment:

```bash
# Run Claude Code for AI package
claude -p "Update packages/ai/src/key-manager.ts to support multiple providers from database. Add AIProviderRouter class that loads providers from Prisma, implements priority-based selection with automatic fallback, rate limit tracking (RPM/TPM), and cooldown on rate limit. Create packages/ai/src/router.ts with the router implementation. Update packages/ai/src/index.ts to export the router." --add-dir d:/cuti/packages/ai
```

### Files Claude Code Creates/Modifies:
- `packages/ai/src/router.ts` (NEW)
- `packages/ai/src/key-manager.ts` (MODIFY)
- `packages/ai/src/index.ts` (MODIFY)

### Files I Create (Admin UI):
- `apps/admin/src/app/ai-settings/page.tsx`
- `apps/admin/src/components/AiProviderForm.tsx`

**No conflict** — Claude Code touches packages, I touch admin app.

---

## Phase 2: CV Builder (Split)

### Claude Code (Backend):
```bash
# CV API routes
claude -p "Create apps/dashboard/src/app/api/cv/route.ts for CV project CRUD. Create apps/dashboard/src/app/api/cv/[id]/route.ts for individual CV operations. Use Prisma client from @repo/db. Implement GET (list), POST (create), GET [id] (detail), PUT [id] (update), DELETE [id] (delete)." --add-dir d:/cuti/apps/dashboard/src/app/api

# CV Worker
claude -p "Create packages/worker/src/processors/cv.processor.ts that processes CV projects with AI. Receives CV project ID, loads data from Prisma, calls AI with structured prompt, updates CV sections, marks project as READY. Add error handling and retry logic." --add-dir d:/cuti/packages/worker
```

### Subagent Hermes (Frontend):
```python
delegate_task(
    goal="Build CV wizard components for apps/dashboard/src/components/cv-wizard/",
    context="""
    Create the following files:
    1. cv-wizard/index.tsx - Main wizard container with step management
    2. cv-wizard/step-upload.tsx - Upload CV step
    3. cv-wizard/step-personal.tsx - Personal info step
    4. cv-wizard/step-experience.tsx - Work experience step
    5. cv-wizard/step-education.tsx - Education step
    6. cv-wizard/step-skills.tsx - Skills step
    7. cv-wizard/step-review.tsx - Review & submit step
    
    Use Zustand for state management. Follow navy+orange design system.
    """,
    toolsets=['coding', 'file']
)
```

**No conflict** — Claude Code touches API routes, Subagent touches components.

---

## Phase 3: Tracker (Subagent Hermes)

### Subagent Hermes:
```python
delegate_task(
    goal="Implement kanban board with drag-drop for apps/dashboard/src/app/tracker/page.tsx",
    context="""
    1. Install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
    2. Create apps/dashboard/src/components/kanban/ directory
    3. Create kanban/kanban-board.tsx - Main board with DndContext
    4. Create kanban/kanban-column.tsx - Column component
    5. Create kanban/kanban-card.tsx - Draggable card
    6. Modify apps/dashboard/src/app/tracker/page.tsx to use new components
    7. Implement onDragEnd to update application status
    
    Follow the existing tracker page structure and design system.
    """,
    toolsets=['coding', 'file', 'terminal']
)
```

### Claude Code (API):
```bash
claude -p "Create apps/dashboard/src/app/api/applications/route.ts for application tracking CRUD. Create apps/dashboard/src/app/api/applications/[id]/route.ts for individual operations. Use Prisma client from @repo/db." --add-dir d:/cuti/apps/dashboard/src/app/api
```

**No conflict** — Subagent touches components, Claude Code touches API routes.

---

## Phase 4: Payment (Claude Code)

### Claude Code:
```bash
# Payment package
claude -p "Create packages/payment/src/midtrans.ts with Midtrans integration. Install midtrans-client. Create functions: createSnapToken, handleNotification, verifyPayment. Create packages/payment/src/index.ts to export." --add-dir d:/cuti/packages/payment

# Payment API
claude -p "Create apps/dashboard/src/app/api/payment/route.ts for payment processing. Create apps/dashboard/src/app/api/payment/callback/route.ts for Midtrans webhooks." --add-dir d:/cuti/apps/dashboard/src/app/api

# Order API
claude -p "Create apps/dashboard/src/app/api/orders/route.ts for order management. Implement POST (create order), GET (list orders), PATCH [id] (update status)." --add-dir d:/cuti/apps/dashboard/src/app/api
```

**I handle checkout page UI** — no conflict with Claude Code.

---

## Phase 5: Email (Claude Code)

### Claude Code:
```bash
# Email package
claude -p "Create packages/email/src/client.ts with Resend integration. Install resend. Create functions: sendOrderConfirmation, sendCvReady, sendReferralReward, sendWelcome. Create packages/email/src/index.ts to export. Create email templates in packages/email/templates/." --add-dir d:/cuti/packages/email

# Email worker
claude -p "Update packages/queue/src/queues/notification.queue.ts and create packages/worker/src/processors/email.processor.ts for async email sending." --add-dir d:/cuti/packages/worker
```

**No conflict** — all backend.

---

## Phase 6: Referral (Me + Subagent)

### Me:
- Referral API routes
- Tiered reward logic

### Subagent Hermes:
```python
delegate_task(
    goal="Build referral dashboard UI for apps/dashboard/src/app/referral/page.tsx",
    context="""
    Create/refactor the referral page with:
    1. Referral code display with copy button
    2. Stats tiles (total referral, active, earned)
    3. Tier progress indicator
    4. Withdrawal history
    5. Share buttons (WhatsApp, Instagram)
    
    Follow the existing design system with navy+orange.
    """,
    toolsets=['coding', 'file']
)
```

---

## Phase 7: Marketplace & SEO (Claude Code + Subagent)

### Claude Code (Backend):
```bash
# Marketplace API
claude -p "Create apps/marketplace/src/app/api/jobs/route.ts for job listings API. Implement GET with filters, search, pagination. Create apps/marketplace/src/app/api/jobs/[id]/route.ts for job detail." --add-dir d:/cuti/apps/marketplace/src/app/api

# SEO
claude -p "Create apps/marketplace/src/app/[category]/[location]/page.tsx for dynamic SEO pages. Implement generateStaticParams for static generation. Add JSON-LD structured data and meta tags." --add-dir d:/cuti/apps/marketplace/src/app
```

### Subagent Hermes (Frontend):
```python
delegate_task(
    goal="Build landing page for apps/web/src/app/page.tsx",
    context="""
    Create the landing page with sections:
    1. Hero with gradient background
    2. Features bento grid
    3. How it works (3 steps)
    4. Pricing cards (3 tiers)
    5. Testimonials carousel
    6. FAQ accordion
    7. Final CTA
    8. Footer
    
    Use navy+orange design system. Mobile-first responsive.
    """,
    toolsets=['coding', 'file']
)
```

---

## Conflict Prevention Rules

### 1. Git Branches
Each agent works on its own branch:
```
main
├── feat/ai-multi-provider (Claude Code)
├── feat/cv-builder (Claude Code + Subagent)
├── feat/tracker-dnd (Subagent)
├── feat/payment (Claude Code)
├── feat/email (Claude Code)
├── feat/referral (Me + Subagent)
└── feat/marketplace-seo (Claude Code + Subagent)
```

### 2. File Ownership
| Path | Owner |
|---|---|
| `packages/*` | Claude Code |
| `apps/*/src/app/api/*` | Claude Code |
| `apps/*/src/components/*` | Subagent Hermes |
| `apps/*/src/app/*/page.tsx` | Depends on task |

### 3. Communication Protocol
Before starting a task, each agent checks:
```
1. Am I touching files owned by another agent?
2. If yes, STOP and ask coordinator
3. If no, proceed
```

---

## Execution Sequence

```
Week 1:
├── Day 1-2: Phase 0 (Infrastructure) - Me
├── Day 3-4: Phase 1 (AI System) - Claude Code
└── Day 5: Phase 2 (CV Builder start) - Split

Week 2:
├── Day 1-2: Phase 2 (CV Builder finish) - Split
├── Day 3: Phase 3 (Tracker) - Subagent
└── Day 4-5: Phase 4 (Payment) - Claude Code

Week 3:
├── Day 1-2: Phase 5 (Email) - Claude Code
├── Day 3: Phase 6 (Referral) - Me + Subagent
└── Day 4-5: Phase 7 (Marketplace) - Split

Week 4:
├── Day 1-2: Phase 8 (Polish) - All
└── Day 3-5: Phase 9 (Deployment) - Me
```

---

## Monitoring Progress

I track progress via:
1. Git commits (each agent commits frequently)
2. File changes (check what was modified)
3. Test results (run after each phase)
4. Manual verification (check UI, test flows)

---

*Last updated: 2026-06-27*
