# CUTI — API Contract

Base URL: `https://api.cuti.id/v1`

## Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "CV_LIMIT_REACHED",
    "message": "Free users can create max 2 CVs. Upgrade to Premium.",
    "statusCode": 403
  }
}
```

## Auth Header
```
Authorization: Bearer <access_token>
```

---

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register (email/password) |
| POST | /auth/login | Login |
| POST | /auth/google | Google OAuth callback |
| POST | /auth/refresh | Refresh token |
| POST | /auth/forgot-password | Request reset |
| POST | /auth/reset-password | Confirm reset |
| POST | /auth/logout | Logout |
| GET | /auth/me | Current user profile |

## User & Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/me | Full profile |
| PATCH | /users/me | Update profile |
| PATCH | /users/me/preferences | Career preferences |
| POST | /users/me/avatar | Upload avatar |
| GET | /users/me/stats | Dashboard stats summary |

## CV Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /cv | List all CVs (with ATS score) |
| POST | /cv | Create new CV |
| GET | /cv/:id | Get CV detail |
| PATCH | /cv/:id | Update CV |
| DELETE | /cv/:id | Delete CV |
| GET | /cv/:id/pdf | Download PDF |
| POST | /cv/:id/ats-score | Recalculate ATS score |
| POST | /cv/import | Upload & parse existing CV |

## CV Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /templates | List templates (filter: category, free/premium) |
| GET | /templates/:id | Template detail |
| GET | /templates/:id/preview | Preview HTML |

## AI CV Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai-cv-service | Order AI CV service |
| GET | /ai-cv-service | List my orders |
| GET | /ai-cv-service/:id | Order detail + progress |
| POST | /ai-cv-service/:id/revisi | Request revision |
| GET | /ai-cv-service/:id/download | Download final CV |

## AI Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai/screener | Run AI CV Screener |
| GET | /ai/screener | List screenings |
| GET | /ai/screener/:id | Screening detail |
| POST | /ai/ats-match | Run ATS Match Analysis |
| GET | /ai/ats-match | List matches |
| GET | /ai/ats-match/:id | Match detail |
| POST | /ai/cover-letter | Generate cover letter |
| GET | /ai/cover-letter | List cover letters |
| GET | /ai/cover-letter/:id | Cover letter detail |
| PATCH | /ai/cover-letter/:id | Edit cover letter |
| POST | /ai/email-builder | Generate email |
| GET | /ai/email-builder | List emails |
| GET | /ai/email-builder/:id | Email detail |
| POST | /ai/wa-template | Generate WA template |
| GET | /ai/wa-template | List templates |
| POST | /ai/heatmap | Generate CV heatmap |
| GET | /ai/heatmap/:id | Heatmap result |

## Job Application

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /jobs | List applications (filter: status) |
| POST | /jobs | Add application |
| GET | /jobs/:id | Application detail |
| PATCH | /jobs/:id | Update (status, notes) |
| DELETE | /jobs/:id | Remove application |
| PATCH | /jobs/:id/move | Move to status (Kanban) |
| GET | /jobs/stats | Pipeline statistics |
| GET | /jobs/timeline | Upcoming interviews/reminders |

## Job Listings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /listings | Browse lowongan (search, filter) |
| GET | /listings/:id | Lowongan detail |
| POST | /listings/:id/save | Save/bookmark |
| GET | /listings/recommended | AI-recommended jobs |

## Interview Center

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /interview/mock | Start mock interview |
| GET | /interview/mock | List sessions |
| GET | /interview/mock/:id | Session detail |
| POST | /interview/mock/:id/answer | Submit answer |
| GET | /interview/mock/:id/eval | Get evaluation |
| GET | /interview/questions | Question bank (filter) |
| GET | /interview/star-guide | STAR guide content |

## Latihan Soal

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /practice/categories | List categories |
| GET | /practice/questions | Get questions (filter) |
| POST | /practice/answer | Submit answer |
| GET | /practice/progress | My progress & stats |
| POST | /practice/toefl/start | Start TOEFL simulation |
| GET | /practice/toefl/:id | TOEFL session detail |
| POST | /practice/toefl/:id/answer | Submit TOEFL answer |
| GET | /practice/toefl/:id/result | TOEFL result |

## LinkedIn Optimizer

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /linkedin/analyze | Analyze LinkedIn profile |
| GET | /linkedin/analyze | List analyses |
| GET | /linkedin/analyze/:id | Analysis detail |
| POST | /linkedin/generate | Generate optimized content |

## Campaign & Commission

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /campaigns | Browse active campaigns |
| GET | /campaigns/:id | Campaign detail |
| POST | /campaigns/:id/join | Join campaign |
| POST | /campaigns/:id/submit | Submit proof |
| GET | /campaigns/submissions | My submissions |
| GET | /commission/balance | Commission balance |
| GET | /commission/history | Commission history |
| POST | /commission/withdraw | Request withdrawal |
| GET | /commission/withdrawals | Withdrawal history |

## Referral

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /referral/code | My referral code & link |
| GET | /referral/history | Referral history |
| GET | /referral/rewards | Rewards earned |

## Gamification

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /gamification/profile | XP, level, badges |
| GET | /gamification/leaderboard | Leaderboard |
| GET | /gamification/badges | All badges + earned status |

## Career Readiness

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /readiness/score | Current readiness score |
| GET | /readiness/roadmap | Improvement roadmap |
| GET | /readiness/insights | AI insights |

## Membership & Payment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /membership/plans | Available plans |
| POST | /membership/subscribe | Subscribe |
| GET | /membership/current | Current membership |
| POST | /membership/cancel | Cancel auto-renew |
| POST | /payment/create | Create payment (Midtrans) |
| POST | /payment/callback | Midtrans webhook (internal) |
| GET | /payment/history | Payment history |

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notifications | List notifications |
| PATCH | /notifications/:id/read | Mark as read |
| PATCH | /notifications/read-all | Mark all as read |
| GET | /notifications/unread-count | Unread count |

## Admin — Campaign Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /admin/campaigns | Create campaign |
| PATCH | /admin/campaigns/:id | Update campaign |
| DELETE | /admin/campaigns/:id | Delete campaign |
| GET | /admin/campaigns/:id/submissions | List submissions |
| PATCH | /admin/campaigns/:id/submissions/:sid | Approve/reject |
| POST | /admin/campaigns/:id/payout | Process payout |

## Admin — User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/users | List users (search, filter, paginate) |
| GET | /admin/users/:id | User detail |
| PATCH | /admin/users/:id | Update user (role, status) |
| GET | /admin/users/:id/ai-usage | AI usage per user |
| GET | /admin/analytics | Platform analytics |

## Admin — Content & Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | /admin/templates/* | Template management |
| CRUD | /admin/articles/* | Article management |
| CRUD | /admin/courses/* | Course management |
| CRUD | /admin/sertifikasi/* | Certification management |
| CRUD | /admin/events/* | Event management |
| CRUD | /admin/questions/* | Practice question management |

## System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /dashboard/stats | Admin dashboard stats |
