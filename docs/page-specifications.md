# CUTI — Page Specifications

**Version:** 1.0  
**Last Updated:** 2026-07-30  
**Platform:** Web (responsive, mobile-first)

---

## Overview

This document provides detailed specifications for all pages in the CUTI platform, including layout, content structure, interactions, and responsive behavior.

---

## 1. Landing Page (Astro)

**URL:** `https://employr.id`  
**Goal:** Convert visitors to registered users  
**Key Metric:** Sign-up conversion rate

### 1.1 Hero Section

**Layout:**
- Full viewport height (`100vh`)
- Centered content with max-width `1280px`
- Background: Warm gray `#D7D6D5` with animated gradient mesh

**Content:**
- **Headline (Display):** "AI Career Operating System untuk Pencari Kerja Indonesia"
- **Subheadline (Body Large):** "Dari CV hingga offering dalam satu platform. Powered by AI."
- **CTA Primary:** "Mulai Gratis" → `/register`
- **CTA Secondary (Ghost):** "Lihat Demo" → Scroll to demo video or `/demo`

**Visual Element:**
- Floating glass mockup of dashboard
- Parallax effect: Moves at 0.8× scroll speed
- Subtle animation: Float up/down 10px over 4s

**Responsive:**
- Mobile: 40px headline, single CTA, mockup below text

### 1.2 Features Section

**Layout:**
- Bento grid: 3×2 (desktop), 2×3 (tablet), 1×6 (mobile)
- Section padding: 120px vertical (desktop), 80px (mobile)
- Headline: "Semua yang Anda Butuhkan untuk Mendapatkan Pekerjaan Impian"

**Feature Cards (6 total):**

1. **CV Builder ATS**
   - Icon: Document with checkmark
   - Headline: "CV ATS-Optimized"
   - Description: "Template profesional yang lolos sistem ATS dengan score real-time"

2. **AI Screener**
   - Icon: Robot/AI chip
   - Headline: "AI CV Screener"
   - Description: "Analisis CV seperti recruiter profesional, lengkap dengan rekomendasi"

3. **Job Tracker**
   - Icon: Kanban board
   - Headline: "Kelola Lamaran"
   - Description: "Track semua lamaran dalam satu dashboard Kanban yang intuitif"

4. **Interview Prep**
   - Icon: Microphone
   - Headline: "Latihan Interview AI"
   - Description: "Mock interview dengan AI evaluator dan feedback real-time"

5. **LinkedIn Optimizer**
   - Icon: LinkedIn logo
   - Headline: "Optimasi LinkedIn"
   - Description: "AI-powered profile analyzer dan content generator untuk networking"

6. **Campaign & Komisi**
   - Icon: Dollar/Coin
   - Headline: "Dapat Uang"
   - Description: "Join campaign, selesaikan task, withdraw komisi ke rekening Anda"

**Card Interaction:**
- Hover: Lift 4px + scale 1.02
- Click: Navigate to feature detail or register

### 1.3 How It Works

**Layout:**
- Vertical timeline with 4 steps
- Alternating left/right content (desktop), stacked (mobile)

**Steps:**

1. **Daftar Gratis**
   - Icon: User plus
   - Description: "Buat akun dengan Google atau email dalam 30 detik"

2. **Buat CV ATS**
   - Icon: Document edit
   - Description: "Pilih template, isi data, dapatkan ATS score real-time"

3. **Screening AI**
   - Icon: Magnifying glass + AI
   - Description: "AI analyze CV Anda seperti recruiter profesional"

4. **Lamar & Track**
   - Icon: Rocket
   - Description: "Kirim lamaran dan kelola pipeline sampai offering"

**Animation:**
- Staggered fade-in as user scrolls (50ms delay per step)

### 1.4 Pricing Section

**Layout:**
- 3 pricing cards (horizontal on desktop, vertical on mobile)
- Toggle: Monthly / Annual (shows "Save 33%" badge when Annual)

**Cards:**

**Free Tier**
- Price: Rp 0
- Features:
  - ✅ 2 CV maksimal
  - ✅ 10 lamaran tracking
  - ✅ Template dasar
  - ❌ AI Screener
  - ❌ Interview prep
  - ❌ LinkedIn optimizer
- CTA: "Mulai Gratis"

**Monthly Premium**
- Price: Rp 49.000/bulan
- Badge: None
- Features:
  - ✅ Unlimited CV
  - ✅ Unlimited tracking
  - ✅ Semua template premium
  - ✅ AI Screener unlimited
  - ✅ Interview prep unlimited
  - ✅ LinkedIn optimizer
  - ✅ Priority support
- CTA: "Pilih Monthly"

**Annual Premium** (Popular)
- Price: Rp 399.000/tahun
- Badge: "Paling Hemat" (gold gradient)
- Subprice: "Rp 33.250/bulan"
- Savings badge: "Save 33%"
- Features: Same as Monthly
- CTA: "Pilih Annual" (gradient button)

**Feature Comparison Table:**
- Sticky header row
- Show/hide toggle: "Lihat Perbandingan Lengkap"

### 1.5 Testimonials

**Layout:**
- Horizontal carousel
- 3 visible cards (desktop), 1 (mobile)
- Auto-rotate every 5 seconds

**Testimonial Card:**
- Avatar (64px circle)
- Name (H4)
- Role + Company (caption, gray)
- Quote (body text, max 3 lines)
- Rating: 5 stars

**Navigation:**
- Dot indicators below
- Arrow buttons (left/right)
- Pause on hover

### 1.6 CTA Section

**Content:**
- Headline: "Siap Mendapatkan Pekerjaan Impian?"
- Subheadline: "Join 1,000+ pencari kerja yang sudah berhasil dengan CUTI"
- CTA: "Mulai Gratis Sekarang" (large gradient button)

**Background:**
- Gradient mesh (indigo/violet)
- Glass overlay

### 1.7 Footer

**Layout:**
- 4 columns + branding column
- Background: Slightly darker glass

**Columns:**

1. **Product**
   - CV Builder
   - AI Tools
   - Job Tracker
   - Interview Prep
   - Academy

2. **Company**
   - About Us
   - Blog
   - Careers
   - Contact

3. **Resources**
   - Help Center
   - API Docs
   - Templates
   - Changelog

4. **Legal**
   - Privacy Policy
   - Terms of Service
   - Cookie Policy

**Branding Column:**
- Logo
- Tagline: "Career Operating System"
- Social media icons (LinkedIn, Instagram, Twitter)

---

## 2. Dashboard (Career Command Center)

**URL:** `/dashboard`  
**Auth:** Required  
**Layout:** Bento Grid (3 columns desktop, 2 tablet, 1 mobile)

### 2.1 Top Navigation

**Glass Navbar (Floating Pill):**
- Position: Fixed top, 80px from viewport
- Content:
  - Logo (left)
  - Nav links (center): Dashboard, CV, Jobs, Interview, Academy, Settings
  - User menu (right): Avatar + name + premium badge + dropdown

**User Dropdown Items:**
- Profile
- Settings
- Billing
- Help Center
- Logout

**Mobile:**
- Hamburger menu (right side slide-in)
- Logo center

### 2.2 Welcome Card (2×1 span)

**Content:**
- Greeting: "Hi, [Name]! 👋" (H2)
- Membership status:
  - Free: "Upgrade ke Premium" button
  - Premium: Gold badge "Premium Member" + expiry date
- Career Readiness:
  - Progress bar (percentage)
  - Label: "Career Readiness: 65%"
- Quick Actions (2 buttons):
  - "Buat CV Baru" (primary)
  - "Lihat Lowongan" (secondary)

### 2.3 ATS Score Card (1×1)

**Content:**
- Large circular progress (78/100)
- Label: "ATS Score"
- Status badge: "Excellent" (green), "Borderline" (amber), "Needs Work" (red)
- Breakdown (3 mini bars):
  - Keyword: 85%
  - Experience: 70%
  - Formatting: 80%
- CTA: "Tingkatkan Score" (small button)

### 2.4 Application Stats (1×1)

**Content:**
- Grid: 2×2 stat tiles
- Metrics:
  - **Top-left:** "Lamaran Aktif" — 5 (blue icon)
  - **Top-right:** "Screening" — 3 (violet icon)
  - **Bottom-left:** "Interview" — 2 (indigo icon)
  - **Bottom-right:** "Offering" — 1 (green icon)
- Each tile: Number (H2) + label (caption)

### 2.5 Career Readiness (1×1)

**Content:**
- Progress bar: 65%
- Checklist (4 items):
  - CV: ✅ "Complete"
  - LinkedIn: ⚠️ "Needs optimization"
  - Interview: ⚠️ "Practice needed"
  - Network: ❌ "Not started"
- CTA: "Lengkapi Profil"

### 2.6 AI Career Advisor (1×1)

**Content:**
- Icon: 💡 (large)
- Tip text: "Tambahkan skill Python untuk boost match score 23%"
- CTA: "Apply Suggestion" (applies suggestion to CV)
- Refresh button (icon only, top-right)

### 2.7 Daily Mission (1×1)

**Content:**
- Icon: 🎯
- Mission title: "Daftar Bank X"
- Commission: "Rp 50.000" (H3, green)
- Deadline: "3 hari lagi" (caption, amber)
- CTA: "Join Sekarang"

### 2.8 Job Recommendations (3×1 span)

**Content:**
- Headline: "Lowongan Cocok untuk Anda"
- Horizontal carousel: 4-6 job cards
- Each card (260px wide):
  - Company logo (top)
  - Position (H4)
  - Location + salary range
  - Match score badge: "85% Match" (green)
  - CTA: "Lamar Sekarang"
- Navigation: Arrow buttons + dots

### 2.9 Content Grid (3×1 span, 3 cards)

**Cards:**

1. **Artikel**
   - Icon: Document
   - Text: "3 artikel terbaru"
   - CTA: "Baca"

2. **Academy**
   - Icon: Graduation cap
   - Text: "2 kursus baru"
   - CTA: "Explore"

3. **Event**
   - Icon: Calendar
   - Text: "Job Fair Jakarta, 15 Agustus"
   - CTA: "Daftar"

---

## 3. CV Builder

**URL:** `/cv/builder` or `/cv/builder/:id`  
**Auth:** Required  
**Layout:** Split view (desktop), tabbed (mobile)

### 3.1 Top Bar

**Content:**
- Left: "Back" button + CV title (editable inline)
- Center: ATS Score badge (floating pill, live updates)
- Right: "Save Draft" (secondary) + "Download PDF" (primary)

### 3.2 Left Sidebar (400px, desktop only)

**Template Selector:**
- Dropdown: Template thumbnails
- Categories: All, ATS, Executive, Creative

**Data Input Sections (Accordion):**

1. **Informasi Pribadi**
   - Foto (upload, 200×200px, circle crop)
   - Nama Lengkap (required)
   - Email (required)
   - Phone
   - LinkedIn URL
   - Portfolio URL
   - Location

2. **Ringkasan Profesional**
   - Textarea (max 500 chars)
   - Character counter
   - AI button: "Generate Ringkasan" → modal with 3 variations

3. **Pengalaman Kerja** (Repeatable)
   - Company (required)
   - Position (required)
   - Start Date (MM/YYYY)
   - End Date or "Current" checkbox
   - Description (textarea)
   - Achievements (list, add bullet point)
   - AI button: "Improve with AI" → suggestions
   - Delete button (icon, top-right)
   - "+ Add Experience" button

4. **Pendidikan** (Repeatable)
   - Institution (required)
   - Degree (required)
   - Field of Study
   - Start Date
   - End Date
   - GPA (optional)

5. **Skill** (Tag Input)
   - Tag input with autocomplete
   - Level: Beginner, Intermediate, Advanced, Expert
   - "+ Add Skill" button

6. **Sertifikasi** (Repeatable)
   - Name
   - Issuer
   - Date
   - Credential URL

7. **Proyek** (Repeatable)
   - Name
   - Description
   - Tech Stack (tags)
   - Project URL

8. **Bahasa** (Repeatable)
   - Language
   - Proficiency: Basic, Conversational, Professional, Native

9. **Organisasi** (Repeatable)
   - Name
   - Role
   - Start Date - End Date
   - Description

### 3.3 Right Preview (Desktop)

**Content:**
- A4 paper preview (aspect ratio 210:297)
- Live updates as user types
- Zoom controls: 50%, 75%, 100%, 125%
- Deep paper shadow for realism

### 3.4 Mobile Layout

**Tabs:**
- "Input" tab: All sections (accordion, full-width)
- "Preview" tab: Full-screen preview (pinch to zoom)

**Sticky Bottom Bar:**
- "Save Draft" + "Download PDF"

### 3.5 ATS Score Modal (Click score badge)

**Content:**
- Hero score: Circular progress (large)
- Breakdown:
  - Keyword matching: X/15 found
  - Experience relevance: Score
  - Formatting: Pass/Fail
  - Contact info: Complete/Incomplete
- Recommendations (top 3)
- CTA: "Close" or "View Full Report"

---

## 4. Job Tracker

**URL:** `/jobs`  
**Auth:** Required  
**Layout:** Kanban (default) or List view

### 4.1 Top Bar

**Content:**
- Left: Page title "Job Applications"
- Right: View toggle (Kanban | List) + "+ Add Application" button

### 4.2 Kanban View

**Columns (5):**
1. Terkirim (Blue)
2. Screening (Violet)
3. Interview (Indigo)
4. Offering (Green)
5. Ditolak (Red)

**Column Header:**
- Title + count badge
- "+ Add" icon button

**Job Card (280×160px):**
- Company logo (40px circle, top-left)
- Position title (H4, max 2 lines, truncate)
- Location (caption, gray)
- Applied date (caption, gray)
- Match score badge (if available): "85% Match"
- Drag handle (6 dots, left edge, visible on hover)

**Interaction:**
- Drag & drop between columns
- Click card → opens detail modal
- Long press (500ms) on mobile activates drag

**Add Application Modal:**
- Fields: Company, Position, Location, Applied Date, Job Description (optional), Status
- CTA: "Add Application"

### 4.3 List View

**Table Columns:**
- Company (with logo)
- Position
- Location
- Status (colored badge)
- Applied Date
- Match Score
- Actions (icons: View, Edit, Delete)

**Features:**
- Sort by column (click header)
- Filter by status (dropdown)
- Search (top-right)

### 4.4 Job Detail Modal

**Tabs:**
1. **Overview**
   - Company logo + name
   - Position title
   - Location, salary range, job type
   - Applied date
   - Current status
   - Match score (if available)

2. **Job Description**
   - Full job description text (scrollable)
   - Copy button

3. **Notes**
   - Rich text editor
   - Auto-save

4. **Timeline**
   - Chronological events:
     - Applied: [Date]
     - Screening: [Date]
     - Interview: [Date + time]
     - Offering/Rejected: [Date]

**Bottom Actions:**
- "Update Status" dropdown
- "Add Note" button
- "Delete Application" (danger)

---

## 5. AI Screener

**URL:** `/ai/screener`  
**Auth:** Required  
**Flow:** CV selection → Recruiter type → Analysis → Results

### 5.1 Step 1: CV Selection

**Content:**
- Headline: "AI CV Screener"
- Subheadline: "Dapatkan analisis CV dari perspektif recruiter profesional"
- CV list (radio selection):
  - Each item: CV title, last updated, ATS score
- CTA: "Next" (disabled until selection)

### 5.2 Step 2: Recruiter Type

**Content:**
- Question: "Tipe perusahaan yang Anda targetkan?"
- Options (cards, single selection):
  - Startup (icon: rocket)
  - Corporate (icon: building)
  - MNC (icon: globe)
  - BUMN (icon: government)
- CTA: "Analyze CV" (primary, gradient)

### 5.3 Analysis Loading

**Content:**
- Full-screen overlay (glass background)
- Central spinner (60px, indigo gradient)
- Progress text (changes every 10s):
  - "Analyzing CV structure..."
  - "Checking ATS compatibility..."
  - "Evaluating experience relevance..."
  - "Generating recommendations..."
- Estimated time: "~30 seconds"

### 5.4 Results Page

**Hero Score Card (Full-width, centered):**
- Large circular progress (120px): 78/100
- Status: "PASS ✅" (H2, green) or "BORDERLINE ⚠️" (amber) or "FAIL ❌" (red)
- Subtext: "Your CV is likely to pass ATS screening"

**Keyword Analysis (2×1 card):**
- Found keywords: Green pill badges (12 found)
- Missing keywords: Red pill badges with ! icon (Python, Docker, CI/CD)
- CTA: "Add Missing Keywords"

**ATS Score Breakdown (1×1 card):**
- Horizontal bar chart:
  - Keyword: 85%
  - Experience: 70%
  - Formatting: 80%
  - Contact: 90%

**Eye Tracking Heatmap (2×2 card):**
- CV preview with heatmap overlay
- Legend: Red (high attention) → Blue (low attention)
- Caption: "Areas recruiters focus on in first 6 seconds"

**Red Flags (1×1 card):**
- 🚩 icon (large)
- List:
  - Employment gap: 6 months (2023) — High
  - Job hopping: 3 companies in 2 years — Medium
  - Typo: "manajer" → "manager" — Low
- Each item: Severity badge

**AI Recommendations (2×1 card):**
- 💡 icon
- Numbered list (top 5 recommendations)
- Each item: "Apply" button (quick fix)
- CTA: "Apply All"

**Predicted Interview Questions (1×2 card):**
- 🎯 icon
- List (3-5 questions based on red flags)
- CTA: "Practice Answers" → Interview Center

**Bottom Actions:**
- Primary: "Improve CV Now" → CV Builder with suggestions
- Secondary: "Download Report" (PDF)
- Tertiary: "Analyze Another CV"

---

## 6. Payment/Membership

### 6.1 Pricing Page

**URL:** `/pricing`  
**Auth:** Optional (can view without login)

**Content:** (Same as landing page pricing section, but as standalone page)

### 6.2 Checkout Page

**URL:** `/checkout?plan=monthly` or `annual`  
**Auth:** Required

**Layout:** Split (left: order summary, right: payment)

**Order Summary Card:**
- Plan name: "Premium Monthly"
- Billing cycle: "Billed monthly"
- Subtotal: Rp 49.000
- Discount (if coupon applied): -Rp 5.000
- Total: Rp 44.000
- Coupon input: "Apply Coupon" button

**Payment Method Selection:**
- **Virtual Account:**
  - Radio buttons: BCA, BNI, Mandiri, Permata
  - Icon + bank name
- **E-Wallet:**
  - GoPay, OVO, ShopeePay, DANA
- **QRIS**
- **Credit Card**
  - Card number, expiry, CVV inputs

**Confirmation:**
- Email input (for receipt)
- Checkbox: "Saya setuju dengan Syarat & Ketentuan"
- CTA: "Bayar Sekarang" (primary, full-width, disabled until checkbox)

### 6.3 Payment Pending (VA/QRIS)

**URL:** `/payment/pending/:transactionId`  
**Auth:** Required

**Content:**
- Icon: Hourglass (animated)
- Status: "Menunggu Pembayaran" (H2)
- Transaction ID: Copy button
- Payment instructions:
  - **VA:** Bank name, VA number (copy), amount, expiry time
  - **QRIS:** QR code image, "Scan dengan aplikasi e-wallet"
- Countdown timer: "Bayar dalam 23:45:12"
- CTA: "Saya Sudah Bayar" (checks payment status via polling)
- Secondary: "Batalkan Pembayaran"

### 6.4 Payment Success

**URL:** `/payment/success`  
**Auth:** Required

**Content:**
- Icon: Checkmark (green, animated)
- Headline: "Pembayaran Berhasil!" (H2)
- Order details:
  - Transaction ID
  - Plan: Premium Monthly
  - Amount: Rp 49.000
  - Payment method: BCA Virtual Account
  - Date: [timestamp]
- Receipt: "Dikirim ke email@example.com"
- CTA: "Kembali ke Dashboard"

---

## 7. Auth Pages

### 7.1 Login Page

**URL:** `/login`  
**Layout:** Split screen (desktop), single panel (mobile)

**Left Panel (Desktop only):**
- CUTI logo
- Illustration: Abstract career journey
- Testimonial quote (rotates)

**Right Panel:**
- Headline: "Masuk ke Employr" (H2)
- Google OAuth button: "Lanjutkan dengan Google" (white button, Google logo)
- Divider: "atau"
- Email input
- Password input (show/hide toggle)
- "Lupa password?" link (right-aligned, small)
- CTA: "Masuk" (primary, full-width)
- Footer text: "Belum punya akun? **Daftar**" (link)

### 7.2 Register Page

**URL:** `/register`  
**Layout:** Same split screen

**Right Panel:**
- Headline: "Buat Akun CUTI" (H2)
- Google OAuth button
- Divider: "atau"
- Name input
- Email input
- Password input (strength indicator bar below)
- Password confirmation input
- Checkbox: "Saya setuju dengan **Syarat & Ketentuan**"
- CTA: "Daftar" (primary, full-width, disabled until checkbox)
- Footer text: "Sudah punya akun? **Masuk**"

### 7.3 Forgot Password

**URL:** `/forgot-password`

**Content:**
- Headline: "Reset Password" (H2)
- Subheadline: "Masukkan email Anda dan kami akan kirim link reset"
- Email input
- CTA: "Kirim Link Reset"
- Link: "Kembali ke Login"

### 7.4 Reset Password

**URL:** `/reset-password?token=...`

**Content:**
- Headline: "Buat Password Baru" (H2)
- New password input (strength indicator)
- Confirm password input
- CTA: "Simpan Password"
- Success → Redirect to login with toast: "Password berhasil diubah"

---

## 8. Settings Page

**URL:** `/settings`  
**Auth:** Required  
**Layout:** Sidebar tabs + content area

### 8.1 Sidebar Tabs

- Profile
- Account
- Membership
- Notifications
- Privacy
- Billing

### 8.2 Profile Tab

**Content:**
- Avatar upload (large, center)
- Name (input)
- Headline (input, 80 chars max)
- Location (input)
- Target Position (input)
- Target Industry (select)
- Experience Level (select: Fresh Graduate, 1-3 years, 3-5 years, 5+ years)
- Save button

### 8.3 Account Tab

**Content:**
- Email (display only, verified badge)
- Change email (button → modal)
- Change password (button → modal)
- Connected accounts: Google (disconnect button)
- Delete account (danger button, bottom)

### 8.4 Membership Tab

**Content:**
- Current plan card:
  - Plan name: "Premium Monthly"
  - Status: Active (green badge)
  - Renewal date: "Next billing: 15 Agustus 2026"
  - CTA: "Manage Subscription"
- Plan comparison (same as pricing page)
- Billing history table

### 8.5 Notifications Tab

**Content:**
- Toggle switches:
  - Email notifications
  - Interview reminders
  - Application updates
  - Career tips
  - Marketing emails
  - Campaign opportunities

### 8.6 Privacy Tab

**Content:**
- Profile visibility (Public/Private toggle)
- Data download (button: "Download My Data")
- Data deletion request

### 8.7 Billing Tab

**Content:**
- Payment methods (list):
  - Each: Icon, "•••• 1234", "Set as default", "Remove"
  - "+ Add Payment Method"
- Invoices table:
  - Date, Description, Amount, Status, Download PDF

---

## 9. Responsive Breakpoints Summary

| Page | Mobile (<640px) | Tablet (640-1023px) | Desktop (≥1024px) |
|------|-----------------|---------------------|-------------------|
| Landing | Single column, stacked cards | 2-column grid | 3-column grid, full features |
| Dashboard | 1-column bento, bottom nav | 2-column bento, top nav | 3-column bento, floating nav |
| CV Builder | Tabbed (Input/Preview) | Split view (300px sidebar) | Split view (400px sidebar) |
| Job Tracker | Horizontal scroll kanban | 2 columns visible | 5 columns visible |
| AI Screener | Single column results | 2-column grid | 3-column bento grid |
| Payment | Stacked (summary → payment) | Side-by-side | Side-by-side |
| Auth | Single panel | Split screen | Split screen |
| Settings | Bottom tabs | Sidebar tabs | Sidebar tabs |

---

## 10. Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Landing Page Load | < 1.5s | Static Astro, optimized images |
| Dashboard Time to Interactive | < 2.5s | Client-side rendering |
| CV Builder Load | < 3s | Heavy component, lazy-load preview |
| Job Tracker Load | < 2s | Optimize drag-drop library |
| AI Screener Results | < 35s | Backend processing time |
| Lighthouse Score | > 90 | Performance, Accessibility, Best Practices, SEO |

---

## 11. Accessibility Checklist

- [ ] All pages meet WCAG 2.1 AA color contrast
- [ ] Keyboard navigation works on all interactive elements
- [ ] Focus states visible on all focusable elements
- [ ] Screen reader labels on icon-only buttons
- [ ] Skip navigation link on all pages
- [ ] Semantic HTML (nav, main, article, section, aside)
- [ ] Alt text on all images
- [ ] Form inputs have associated labels
- [ ] Error messages announced to screen readers
- [ ] Modal focus trap (Esc to close)
- [ ] Drag-and-drop has keyboard alternative

---

## Implementation Priority

### Phase 1 (MVP)
1. Landing Page
2. Auth Pages (Login, Register)
3. Dashboard
4. CV Builder
5. Job Tracker (Kanban view only)
6. Payment Pages (Checkout, Success)
7. Settings (Profile, Account, Membership)

### Phase 2
8. AI Screener Results
9. Job Tracker (List view)
10. Settings (complete all tabs)

### Phase 3
11. Landing Page enhancements (testimonials, animations)
12. Mobile optimization pass
13. Performance optimization
14. Accessibility audit & fixes

---

## References

- [Figma Design Files](#) (when created)
- [Design System](./design-system.md)
- [Component Library](./component-library.md)
- [API Contract](./api-contract.md)
