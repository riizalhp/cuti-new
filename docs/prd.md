# CUTI — Product Requirements Document (PRD)

## Product Overview

**Name:** CUTI — Career Portal AI
**Type:** AI Career Operating System
**Target Market:** Indonesian job seekers (fresh graduate to senior professional)
**Initial Target:** 1,000 active users
**Launch Date:** TBD

## Problem Statement

Pencari kerja Indonesia menghadapi fragmentasi proses: CV di satu platform, lowongan di platform lain, latihan interview di tempat lain, dan LinkedIn optimization secara terpisah. Tidak ada satu platform yang mengintegrasikan seluruh journey pencarian kerja.

## Solution

CUTI mengintegrasikan seluruh proses pencarian kerja dalam satu platform berbasis AI. Data CV menjadi pusat yang digunakan oleh semua fitur AI, sehingga rekomendasi saling terhubung dan semakin akurat.

## User Segments

| Segment | Needs | Pain Points |
|---------|-------|-------------|
| Fresh Graduate | CV dari nol, interview prep, job search | Tidak tahu cara buat CV ATS, nervous interview |
| Mahasiswa Akhir | Persiapan karier, skill assessment | Belum punya pengalaman, bingung mulai dari mana |
| Lulusan SMA/SMK | CV sederhana, lowongan entry-level | Akses terbatas, informasi tersebar |
| Career Switcher | CV highlight transferable skills | Gap di CV, sulit pivot tanpa guidance |
| Mid-Level | Optimasi CV, career advancement | Butuh edge di kompetisi |
| Senior | Executive CV, LinkedIn branding | Positioning strategis, networking |

## Features (Prioritized)

### Phase 1 — MVP
- Auth (register, login, Google OAuth)
- Dashboard (career command center)
- CV Builder + Templates + PDF download
- AI CV Screener
- Job Application Tracker (Kanban)
- Membership + Payment (Midtrans)
- Settings & Profile

### Phase 2
- ATS Match Analyzer
- Cover Letter Builder
- Email Builder
- HR WhatsApp Template
- Interview Center (Mock Interview, Question Bank)
- LinkedIn Optimizer
- Latihan Soal (free + paid)
- TOEFL Simulation

### Phase 3
- Campaign & Commission system
- Referral system
- Gamification (XP, badge, leaderboard)
- Career Readiness
- Academy (courses, certs, events)
- CV Heatmap

### Phase 4 (Future)
- Employer portal
- Career coaching marketplace
- Digital products marketplace
- Company insights report
- Salary negotiation kit

## Business Model

### Freemium
| Tier | Features | Limits |
|------|----------|--------|
| Free | CV Builder, Job Tracker | 2 CVs, 10 lowongan, no AI |
| Premium Pass | Everything unlocked | Unlimited |

### Premium Pricing
| Plan | Price (IDR) |
|------|-------------|
| Monthly | Rp 49.000 - 79.000 |
| Quarterly | Rp 129.000 - 199.000 |
| Annual | Rp 399.000 - 599.000 |

### One-Time Purchases
| Product | Price (IDR) |
|---------|-------------|
| AI CV Service (Standard, 24h) | TBD |
| AI CV Service (Express, 1h) | TBD |
| TOEFL Simulation (1x) | Rp 25.000 |
| TOEFL Simulation (5x) | Rp 99.000 |
| Latihan Soal Premium | Included in Premium Pass |

### Campaign & Commission
- Admin creates campaigns (e.g., "Register Bank X account")
- Users join, complete tasks, submit proof
- Admin approves → commission credited
- Users withdraw to bank/e-wallet

## Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Registered users | 1,000 |
| Premium subscribers | 100 (10% conversion) |
| CVs created | 3,000 |
| Applications tracked | 5,000 |
| AI screenings performed | 2,000 |
| Campaign completions | 500 |

## Technical Requirements

- Page load < 3s (landing < 1.5s)
- API response < 500ms (p95)
- Mobile-first responsive
- 99.5% uptime target
- Secure: JWT auth, input validation, rate limiting, CSRF protection

## Constraints

- Budget: bootstrap (minimal cost)
- Team: solo developer initially
- Timeline: MVP in 3-4 months
- Infrastructure: VPS (Sumopod) + Vercel free tier + Cloudflare R2 free tier

## Risks

| Risk | Mitigation |
|------|-----------|
| AI cost spiral | Tiered usage, cache common analyses, use smaller models for simple tasks |
| Feature overload | Phased development, MVP first |
| Low conversion | Strong free→premium hooks, show ATS score teaser |
| User trust (AI CV service) | Transparent about AI process, add human review layer |
| Competition | Focus on Indonesia market, all-in-one advantage |
