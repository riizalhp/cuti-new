# CUTI — User Experience

## Design Philosophy

Luxury SaaS Landing Page dengan kombinasi Glassmorphism, Editorial Minimalism, dan Premium Tech Aesthetic. Terinspirasi dari Apple VisionOS, Linear.app, Arc Browser, Nothing.

Keseluruhan UX dirancang sebagai satu alur terintegrasi — Career Operating System.

## User Journey

```
Daftar Akun → Lengkapi Profil → Buat CV ATS → Optimasi CV AI →
Tes AI Screener → Match dengan Job Description → Generate Cover Letter →
Lamar Kerja → Kelola Pipeline Lamaran → Latihan Interview AI →
Optimasi LinkedIn → Mendapatkan Offering Kerja
```

## Onboarding Flow

### Step 1: Register
- Google OAuth (primary) / Email + Password
- Minimal friction, satu klik

### Step 2: Welcome Wizard (4 halaman)
1. **Target Posisi** — Pilih industri & posisi yang diincar
2. **Pengalaman** — Fresh graduate / experienced / career switcher
3. **CV Awal** — Upload CV lama (AI parse) / mulai dari nol
4. **Tour Fitur** — Quick tour 30 detik, highlight fitur utama

### Step 3: Dashboard
- Personalized berdasarkan input wizard
- Langsung actionable: "Buat CV pertama lo" CTA

## Dashboard (Career Command Center)

Layout: **Bento Grid** (3 kolom, responsive)

```
┌─────────────────────────────────────────────────────┐
│ Glass Navbar (floating, pill shape, blur)            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────┬───────────────────────┐│
│  │ Welcome Card            │ ATS Score             ││
│  │ Hi, Rizal! 👋           │ ████████░░ 78/100     ││
│  │ Premium Member           │ Keyword: 85%          ││
│  │ Career Readiness: 65%   │ Experience: 70%       ││
│  └─────────────────────────┴───────────────────────┘│
│                                                      │
│  ┌───────────┬───────────┬──────────────────────────┐│
│  │ Lamaran   │ Interview │ Career Readiness         ││
│  │ Aktif: 5  │ Besok: 2  │ ████████░░ 65%          ││
│  │ Screen: 3 │ Next: Kam │ CV: ✅ LinkedIn: ⚠️     ││
│  │ Offer: 1  │           │ Interview: ⚠️ Network: ❌││
│  └───────────┴───────────┴──────────────────────────┘│
│                                                      │
│  ┌─────────────────────────┬───────────────────────┐│
│  │ AI Career Advisor       │ Daily Mission         ││
│  │ 💡 "Tambahkan skill     │ 🎯 Daftar Bank X     ││
│  │  Python untuk boost     │ Komisi: Rp 50.000    ││
│  │  match score 23%"       │ Deadline: 3 hari     ││
│  │                         │ [Join Sekarang]       ││
│  └─────────────────────────┴───────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ Lowongan Rekomendasi                             ││
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            ││
│  │ │Job 1 │ │Job 2 │ │Job 3 │ │Job 4 │            ││
│  │ └──────┘ └──────┘ └──────┘ └──────┘            ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌───────────────┬───────────────┬──────────────────┐│
│  │ Artikel       │ Academy       │ Event            ││
│  │ 3 artikel     │ 2 kursus baru │ Job Fair Jakarta ││
│  │ terbaru       │               │ 15 Agustus       ││
│  └───────────────┴───────────────┴──────────────────┘│
└─────────────────────────────────────────────────────┘
```

## CV Builder Experience

### Flow
1. Pilih template → Preview
2. Isi data per section (accordion/tab layout)
3. Real-time A4 preview di sebelah kanan (desktop) atau toggle (mobile)
4. ATS Score update real-time
5. Download PDF / Save draft

### Data Input Sections
| Section | Fields | Notes |
|---------|--------|-------|
| Informasi Pribadi | Nama, email, phone, LinkedIn, portfolio URL, foto | Required minimum |
| Ringkasan Profesional | AI-suggested summary, editable | 2-3 sentences |
| Pengalaman Kerja | Company, position, dates, description | AI bullet point suggestions |
| Pendidikan | Institution, degree, dates, GPA | |
| Skill | Skill name, level (beginner/intermediate/advanced) | Tag-style input |
| Sertifikasi | Name, issuer, date, credential URL | |
| Proyek | Name, description, tech stack, URL | |
| Bahasa | Language, proficiency level | |
| Organisasi | Name, role, dates, description | |
| Portofolio | Title, URL, description | |

### Template Gallery
- **ATS Modern** — Clean, single column, ATS-optimized
- **ATS Standard** — Traditional, two column, conservative
- **Executive** — Premium feel, for senior professionals
- **Creative Tech** — Modern layout for tech/creative roles
- **Fresh Graduate** — Education-first layout, project-focused

## AI CV Screener Experience

### Flow
1. Pilih CV
2. Pilih recruiter type (startup, corporate, MNC, BUMN)
3. Klik "Analyze" → loading animation (progress bar)
4. Hasil: dashboard-style report

### Report Layout
```
┌─────────────────────────────────────────┐
│ ATS Score: 78/100 ████████░░           │
│ Status: BORDERLINE ⚠️                   │
├─────────────────────────────────────────┤
│ Keyword Analysis                        │
│ ✅ Found: 12/15                         │
│ ❌ Missing: Python, Docker, CI/CD       │
├─────────────────────────────────────────┤
│ Eye Tracking Heatmap                    │
│ [CV image with heatmap overlay]         │
├─────────────────────────────────────────┤
│ Red Flags 🚩                            │
│ • Employment gap: 6 months (2023)       │
│ • Job hopping: 3 companies in 2 years   │
├─────────────────────────────────────────┤
│ AI Recommendations 💡                   │
│ 1. Tambahkan "Python" di skills         │
│ 2. Perbaiki format tanggal              │
│ 3. Tambahkan quantified achievement     │
├─────────────────────────────────────────┤
│ Predicted Interview Questions 🎯        │
│ 1. "Ceritakan gap tahun 2023..."        │
│ 2. "Kenapa pindah 3 kali?"              │
└─────────────────────────────────────────┘
```

## Job Tracker Experience

### Kanban View
```
┌─────────┬───────────┬───────────┬──────────┬──────────┐
│ Terkirim│ Screening │ Interview │ Offering │ Ditolak  │
│ (3)     │ (2)       │ (1)       │ (1)      │ (2)      │
├─────────┼───────────┼───────────┼──────────┼──────────┤
│┌───────┐│┌───────┐  │┌───────┐  │┌───────┐ │┌───────┐ │
││Tokop. │││Gojek  │  ││Google │  ││Travel.│ ││Bank X │ │
││Frontend│││Backend │  ││SWE    │  ││PM     │ ││Analyst│ │
│└───────┘│└───────┘  │└───────┘  │└───────┘ │└───────┘ │
│┌───────┐│┌───────┐  │           │          │┌───────┐ │
││Shopee │││BCA    │  │           │          ││Startup│ │
││UI/UX  │││MT     │  │           │          ││Y      │ │
│└───────┘│└───────┘  │           │          │└───────┘ │
└─────────┴───────────┴───────────┴──────────┴──────────┘
```

- Drag & drop antar kolom
- Card click → detail modal
- Reminder badge kalau ada interview mendatang

## Interview Center Experience

### Mock Interview Flow
1. Pilih posisi & company (optional)
2. AI mulai bertanya (1 per round)
3. User jawab (text input)
4. AI evaluate → score + feedback
5. Next question (progressive difficulty)
6. End session → full report

### Latihan Soal Experience
```
┌─────────────────────────────────────────┐
│ Category: Frontend Developer            │
│ Question 3/10                           │
├─────────────────────────────────────────┤
│ "Jelaskan perbedaan antara let, const,  │
│  dan var dalam JavaScript"              │
│                                         │
│ ○ A. Tidak ada perbedaan                │
│ ○ B. let dan const block-scoped, var    │
│      function-scoped                    │
│ ○ C. const bisa diubah, let tidak       │
│ ○ D. var adalah ES6 syntax              │
│                                         │
│ [Submit Answer]                         │
├─────────────────────────────────────────┤
│ ⏱️ 01:45                                 │
└─────────────────────────────────────────┘
```

## Campaign & Commission Experience

### Browse Missions
```
┌─────────────────────────────────────────┐
│ 🔥 Active Campaigns                     │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Daftar Rekening Bank BCA            │ │
│ │ Komisi: Rp 50.000                   │ │
│ │ Deadline: 3 hari lagi               │ │
│ │ Peserta: 45/100                     │ │
│ │ [Lihat Detail]                      │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Daftar Kartu Kredit Bank Mandiri    │ │
│ │ Komisi: Rp 100.000                  │ │
│ │ Deadline: 7 hari lagi               │ │
│ │ Peserta: 12/50                      │ │
│ │ [Lihat Detail]                      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Commission Dashboard
```
┌─────────────────────────────────────────┐
│ 💰 Commission Balance: Rp 250.000      │
│ [Withdraw]                              │
├─────────────────────────────────────────┤
│ History                                 │
│ ✅ Bank BCA referral    +Rp 50.000     │
│ ✅ Mandiri CC signup    +Rp 100.000    │
│ ⏳ GoPay registration  +Rp 25.000     │
│ ❌ Bank BNI referral    Ditolak        │
└─────────────────────────────────────────┘
```

## Glassmorphism Design Language

### Visual Hierarchy
1. **Background** — Warm gray (#D7D6D5) dengan subtle gradient
2. **Glass panels** — Transparent blur dengan white border tipis
3. **Content** — White text di atas glass, hierarchy via opacity
4. **Accent** — Indigo/violet gradient untuk CTA

### Component Styling
- **Navbar** — Floating pill, glass blur, transparan
- **Cards** — Glass effect, 28px radius, subtle shadow
- **Buttons** — Neo skeuomorphism (pill, glossy, multi-layer shadow)
- **Inputs** — Glass background, 16px radius, subtle border
- **Badges** — Pill shape, glass background

### Animation Philosophy
- **Subtle** — Tidak ada animasi yang ramai
- **Purposeful** — Animasi untuk feedback, bukan dekorasi
- **Smooth** — Framer Motion + Lenis smooth scroll
- **Patterns**: fade, blur-in, scale 0.98→1, parallax, hover lift

### Responsive Strategy
- **Mobile-first** (Indonesia = mobile-dominant)
- Breakpoints: sm(640), md(768), lg(1024), xl(1280)
- CV Builder: sidebar preview di desktop, toggle di mobile
- Bento grid: 1 col mobile, 2 col tablet, 3 col desktop
- Kanban: horizontal scroll di mobile
