# CUTI — Requirements

## Functional Requirements

### 1. Authentication & Onboarding
- FR-AUTH-01: Register via email/password
- FR-AUTH-02: Login via Google OAuth
- FR-AUTH-03: Forgot/reset password via email
- FR-AUTH-04: Onboarding wizard (4 steps): target posisi, pengalaman, upload CV, tour fitur
- FR-AUTH-05: Session management (JWT access + refresh token)

### 2. Dashboard
- FR-DASH-01: Welcome card (nama, status membership, Career Readiness)
- FR-DASH-02: Ringkasan lamaran (aktif, screening, interview, offering)
- FR-DASH-03: ATS Score summary per CV
- FR-DASH-04: Career Readiness Score
- FR-DASH-05: AI Career Advisor (rekomendasi otomatis)
- FR-DASH-06: AI Tools shortcut
- FR-DASH-07: Lowongan rekomendasi (personalized)
- FR-DASH-08: Daily Mission card (campaign affiliate)
- FR-DASH-09: Artikel karier
- FR-DASH-10: Academy (kursus, sertifikasi, event)

### 3. CV Management
- FR-CV-01: CV list dengan ATS score per CV
- FR-CV-02: CV Builder (real-time A4 preview)
- FR-CV-03: Data sections: personal info, summary, experience, education, skills, certifications, projects, languages, organizations, portfolio
- FR-CV-04: Template gallery (ATS Modern, Standard, Executive, Creative Tech, Fresh Graduate)
- FR-CV-05: Download PDF
- FR-CV-06: Multiple CV versions
- FR-CV-07: AI CV Service (jasa buat CV oleh AI + review)
  - Standard: 24 jam
  - Express: 1 jam
- FR-CV-08: Upload CV lama → AI parse & restructure
- FR-CV-09: Free tier: max 2 CVs | Premium: unlimited

### 4. AI CV Screener
- FR-SCR-01: Pilih recruiter type / company type
- FR-SCR-02: ATS Score (keyword, experience, layout, completeness)
- FR-SCR-03: Status kelolosan (pass/fail/borderline)
- FR-SCR-04: Catatan recruiter AI
- FR-SCR-05: Keyword analysis
- FR-SCR-06: Eye tracking simulation + heatmap
- FR-SCR-07: Red flag detection
- FR-SCR-08: AI improvement recommendation
- FR-SCR-09: Prediksi pertanyaan interview
- FR-SCR-10: Premium only (free users: 1x trial)

### 5. ATS Match Analyzer
- FR-MATCH-01: Input CV + Job Description
- FR-MATCH-02: Match score
- FR-MATCH-03: Hard skill match, soft skill match, experience match, education match
- FR-MATCH-04: Keywords found & missing
- FR-MATCH-05: CV optimization suggestions
- FR-MATCH-06: Premium only

### 6. Cover Letter Builder
- FR-COVER-01: Input: company, position, recruiter, tone, highlights
- FR-COVER-02: AI-generated professional cover letter
- FR-COVER-03: Template selection
- FR-COVER-04: Edit & customize
- FR-COVER-05: Copy & download
- FR-COVER-06: History/riwayat surat
- FR-COVER-07: Premium only

### 7. Email Builder
- FR-EMAIL-01: AI-generated professional email
- FR-EMAIL-02: Template selection
- FR-EMAIL-03: Edit & customize
- FR-EMAIL-04: Premium only

### 8. HR WhatsApp Template
- FR-WA-01: Template chat WA untuk approach HR/recruiter
- FR-WA-02: AI-generated personalized message
- FR-WA-03: Premium only

### 9. CV Heatmap
- FR-HEAT-01: Eye tracking simulation
- FR-HEAT-02: Visual heatmap overlay pada CV
- FR-HEAT-03: AI optimization suggestions
- FR-HEAT-04: Premium only

### 10. Job Application Tracker
- FR-JOB-01: Kanban view + List view
- FR-JOB-02: Status pipeline: Terkirim → Screening → Interview → Offering → Ditolak
- FR-JOB-03: Drag & drop status change
- FR-JOB-04: Timeline per application
- FR-JOB-05: Reminder (interview schedule)
- FR-JOB-06: Free tier: max 20 lowongan | Premium: unlimited
- FR-JOB-07: Add lowongan manually (URL, company, position)

### 11. Job Listings
- FR-LIST-01: Browse lowongan (search, filter lokasi, industri, tipe)
- FR-LIST-02: Detail lowongan
- FR-LIST-03: Save/bookmark
- FR-LIST-04: AI-recommended jobs based on profile
- FR-LIST-05: Data source: user manual input + link ke job boards

### 12. Interview Center
- FR-INT-01: AI Mock Interview (text-based, voice future)
- FR-INT-02: STAR Guide content
- FR-INT-03: Question Bank (filter: category, difficulty)
- FR-INT-04: Trap Questions collection
- FR-INT-05: Interview Checklist
- FR-INT-06: AI Evaluator (score, feedback, improvement)
- FR-INT-07: Premium only

### 13. Latihan Soal
- FR-PRAC-01: Categories: HR, IT, Finance, Marketing, General, dll
- FR-PRAC-02: Difficulty levels
- FR-PRAC-03: Free: 10 soal/hari, basic categories, no explanation
- FR-PRAC-04: Premium: unlimited, all categories, pembahasan lengkap, AI weakness analysis
- FR-PRAC-05: Progress tracking
- FR-PRAC-06: TOEFL Simulation (paid per session)
  - Full simulation (Listening/Structure)
  - Score prediction
  - Pricing: 1x Rp 25rb / 5x Rp 99rb

### 14. LinkedIn Optimizer
- FR-LI-01: Profile analysis (SEO, SSI Score, headline, about, experience, keywords)
- FR-LI-02: AI-generated headline, bio, networking messages
- FR-LI-03: Outreach message templates
- FR-LI-04: Follow-up message templates
- FR-LI-05: Premium only

### 15. Campaign & Commission
- FR-CAMP-01: Browse active campaigns (missions)
- FR-CAMP-02: Campaign detail (rules, commission, deadline)
- FR-CAMP-03: Join campaign
- FR-CAMP-04: Submit proof (screenshot/file)
- FR-CAMP-05: Track submission status
- FR-CAMP-06: Commission balance
- FR-CAMP-07: Commission history
- FR-CAMP-08: Withdrawal request (bank/e-wallet)
- FR-CAMP-09: Withdrawal history & status tracking

### 16. Admin — Campaign Management
- FR-ADMIN-CAMP-01: Create campaign (title, rules, commission, dates, max participants)
- FR-ADMIN-CAMP-02: Edit/delete campaign
- FR-ADMIN-CAMP-03: Review submissions (approve/reject)
- FR-ADMIN-CAMP-04: Process payouts
- FR-ADMIN-CAMP-05: Campaign analytics

### 17. Admin — User Management
- FR-ADMIN-USR-01: List users (search, filter, paginate)
- FR-ADMIN-USR-02: User detail (profile, CVs, applications, AI usage)
- FR-ADMIN-USR-03: Edit user (role, status, membership)
- FR-ADMIN-USR-04: AI usage monitoring per user

### 18. Admin — Content Management
- FR-ADMIN-CONTENT-01: Article CRUD
- FR-ADMIN-CONTENT-02: Course CRUD
- FR-ADMIN-CONTENT-03: Certification CRUD
- FR-ADMIN-CONTENT-04: Event CRUD
- FR-ADMIN-CONTENT-05: Practice question CRUD

### 19. Admin — Template Management
- FR-ADMIN-TPL-01: CV template CRUD
- FR-ADMIN-TPL-02: Cover letter template CRUD
- FR-ADMIN-TPL-03: Email template CRUD
- FR-ADMIN-TPL-04: WA template CRUD

### 20. Referral System
- FR-REF-01: Referral code & link per user
- FR-REF-02: Track referral history
- FR-REF-03: Reward tracking
- FR-REF-04: Bonus progress

### 21. Gamification
- FR-GAM-01: XP system (earn from activities)
- FR-GAM-02: Level system
- FR-GAM-03: Badge system
- FR-GAM-04: Leaderboard
- FR-GAM-05: Coin system (earn + spend)

### 22. Career Readiness
- FR-READY-01: Score based on 4 pillars (CV, LinkedIn, Interview, Networking)
- FR-READY-02: Roadmap perbaikan
- FR-READY-03: AI insights
- FR-READY-04: Priority tasks

### 23. Membership & Payment
- FR-PAY-01: Premium Pass plans (monthly, quarterly, annual)
- FR-PAY-02: Midtrans integration (VA, e-wallet, QRIS, CC)
- FR-PAY-03: Payment history
- FR-PAY-04: Auto-renew option
- FR-PAY-05: CV Service payment (one-time)
- FR-PAY-06: TOEFL simulation payment (one-time)

### 24. Notifications
- FR-NOTIF-01: In-app notifications
- FR-NOTIF-02: Notification types: submission status, payment, campaign, system
- FR-NOTIF-03: Mark read/unread
- FR-NOTIF-04: Unread count badge

### 25. Settings
- FR-SET-01: Profile edit
- FR-SET-02: Career preferences
- FR-SET-03: Membership management
- FR-SET-04: Theme (light/dark)
- FR-SET-05: Language (ID/EN)
- FR-SET-06: Notification preferences
- FR-SET-07: Account deletion

## Non-Functional Requirements

### Performance
- NFR-PERF-01: Page load < 3 seconds (Landing page < 1.5s)
- NFR-PERF-02: API response < 500ms (95th percentile)
- NFR-PERF-03: AI features < 30s (with queue, show progress)
- NFR-PERF-04: PDF generation < 10s

### Security
- NFR-SEC-01: HTTPS everywhere
- NFR-SEC-02: JWT with short expiry (15min access, 7d refresh)
- NFR-SEC-03: Rate limiting (100 req/min general, 10 req/min AI)
- NFR-SEC-04: Input validation (Zod) on all endpoints
- NFR-SEC-05: CSRF protection
- NFR-SEC-06: File upload validation (type, size max 5MB)
- NFR-SEC-07: Payment webhook signature verification
- NFR-SEC-08: SQL injection prevention (Prisma ORM)
- NFR-SEC-09: XSS prevention (sanitization)

### Scalability
- NFR-SCALE-01: Support 1,000 concurrent users (initial target)
- NFR-SCALE-02: Horizontal scaling ready (stateless API)
- NFR-SCALE-03: Database connection pooling
- NFR-SCALE-04: Redis caching for hot data

### Availability
- NFR-AVAIL-01: 99.5% uptime target
- NFR-AVAIL-02: Graceful degradation (AI features fail → show cached/manual)
- NFR-AVAIL-03: Health check endpoints

### Accessibility
- NFR-A11Y-01: WCAG 2.1 AA compliance (target)
- NFR-A11Y-02: Keyboard navigation support
- NFR-A11Y-03: Screen reader compatible
- NFR-A11Y-04: Mobile responsive (mobile-first for Indonesia market)
