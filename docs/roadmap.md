# CUTI — Roadmap

## Phase 1 — MVP (Month 1-3)

**Goal:** Core value proposition jalan. User bisa buat CV, cek ATS score, track lamaran.

### Week 1-2: Foundation
- [ ] Monorepo setup (Turborepo + pnpm)
- [ ] NestJS project setup + Prisma + PostgreSQL
- [ ] Better Auth + Google OAuth integration
- [ ] User model + auth endpoints
- [ ] Next.js user dashboard setup + Tailwind + shadcn/ui
- [ ] Glassmorphism design system (shared components)
- [ ] Landing page (Astro) scaffold

### Week 3-4: CV Module
- [ ] CV CRUD (create, read, update, delete)
- [ ] CV Builder (real-time A4 preview)
- [ ] Template system (3 templates minimum)
- [ ] PDF generation (Puppeteer/PDFKit)
- [ ] ATS Score calculator (keyword, completeness)
- [ ] CV list page with ATS scores

### Week 5-6: AI Integration
- [ ] AI provider abstraction (Vercel AI SDK)
- [ ] BullMQ queue setup
- [ ] AI CV Screener (basic)
- [ ] AI usage tracking + cost monitoring
- [ ] Free tier rate limiting (1x trial screening)

### Week 7-8: Job Tracker
- [ ] Job Application CRUD
- [ ] Kanban board (drag & drop)
- [ ] List view
- [ ] Status pipeline management
- [ ] Stats dashboard

### Week 9-10: Payment & Membership
- [ ] Midtrans integration
- [ ] Premium Pass subscription flow
- [ ] Free vs Premium feature gating
- [ ] Payment history

### Week 11-12: Polish & Deploy
- [ ] Dashboard (Bento grid home)
- [ ] Onboarding wizard
- [ ] Settings & profile page
- [ ] Notifications (in-app)
- [ ] Landing page content
- [ ] Deploy to Sumopod VPS + Vercel
- [ ] Testing (critical paths)
- [ ] Bug fixes & polish

**Deliverable:** User bisa register, buat CV, cek ATS score, screening (1x free), track lamaran, subscribe premium.

---

## Phase 2 — AI Tools & Interview (Month 4-5)

**Goal:** Full AI toolkit. Interview prep. Revenue diversification.

### Features
- [ ] ATS Match Analyzer (CV vs Job Description)
- [ ] Cover Letter Builder (AI generator + templates)
- [ ] Email Builder (AI + templates)
- [ ] HR WhatsApp Template generator
- [ ] Interview Center
  - [ ] AI Mock Interview (text-based)
  - [ ] Question Bank
  - [ ] STAR Guide
  - [ ] AI Evaluator
- [ ] LinkedIn Optimizer
  - [ ] Profile Analyzer
  - [ ] Content Generator (headline, bio, messages)
- [ ] Latihan Soal
  - [ ] Free tier (10 soal/hari, basic categories)
  - [ ] Premium tier (unlimited, all categories, pembahasan)
  - [ ] Progress tracking
- [ ] TOEFL Simulation (paid per session)

**Deliverable:** Full AI career toolkit. Multiple revenue streams.

---

## Phase 3 — Engagement & Growth (Month 6-7)

**Goal:** User retention, viral growth, community.

### Features
- [ ] Campaign & Commission system
  - [ ] Admin: campaign CRUD, submission review, payout
  - [ ] User: browse, join, submit, withdraw
- [ ] Referral system
  - [ ] Referral code/link generation
  - [ ] Tracking & rewards
- [ ] Gamification
  - [ ] XP & Level system
  - [ ] Badge system
  - [ ] Leaderboard
  - [ ] Coin system
- [ ] Career Readiness
  - [ ] 4-pillar scoring
  - [ ] AI roadmap
  - [ ] Priority tasks
- [ ] CV Heatmap (eye tracking simulation)

**Deliverable:** Engaging platform with retention loops and viral mechanics.

---

## Phase 4 — Content & Community (Month 8-9)

**Goal:** Content ecosystem. Education layer.

### Features
- [ ] CUTI Academy
  - [ ] Course management
  - [ ] Course browsing & enrollment
  - [ ] Progress tracking
- [ ] Sertifikasi
  - [ ] Certification directory
  - [ ] Recommendations based on career path
- [ ] Events
  - [ ] Event listing (job fair, webinar, workshop)
  - [ ] Registration & reminders
- [ ] Articles
  - [ ] Article management (admin)
  - [ ] Article browsing (user)
  - [ ] AI-generated career tips

**Deliverable:** Complete career ecosystem with education layer.

---

## Phase 5 — Scale & Employer (Month 10-12)

**Goal:** Two-sided marketplace. Enterprise features.

### Features
- [ ] Employer Portal
  - [ ] Employer registration
  - [ ] Job posting
  - [ ] Candidate search
  - [ ] Application management
  - [ ] Analytics dashboard
- [ ] Enhanced AI Features
  - [ ] Voice-based mock interview
  - [ ] Company insights report
  - [ ] Salary negotiation kit
- [ ] Career Coaching Marketplace
  - [ ] Coach registration
  - [ ] Session booking
  - [ ] Payment & reviews
- [ ] Digital Products Marketplace
  - [ ] Template marketplace
  - [ ] Creator upload & earn
  - [ ] Platform fee (30%)

**Deliverable:** Two-sided marketplace. Sustainable business model.

---

## Key Milestones

| Month | Milestone |
|-------|-----------|
| 3 | MVP Launch (100 users target) |
| 5 | Full AI Toolkit (500 users target) |
| 7 | Engagement Features (1,000 users target) |
| 9 | Content Ecosystem (2,500 users target) |
| 12 | Employer Portal + Marketplace (5,000 users target) |
