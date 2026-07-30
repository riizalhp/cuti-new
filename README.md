# CUTI - Career Portal AI Platform

CUTI is an AI-powered career platform that helps users create ATS-optimized CVs, get AI screening feedback, track job applications, and access premium career resources.

## Architecture

- **Monorepo**: Turborepo + pnpm
- **Backend**: NestJS 11 + Prisma + PostgreSQL 16
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
- **Auth**: Better Auth + Google OAuth
- **AI**: Vercel AI SDK (OpenAI provider)
- **Queue**: Redis + BullMQ
- **Payment**: Midtrans

## Project Structure

```
cuti/
├── apps/
│   ├── api/          # NestJS REST API
│   ├── user/         # Next.js user dashboard
│   ├── admin/        # Admin dashboard
│   └── landing/      # Marketing landing page
├── packages/
│   ├── db/           # Prisma schema & client
│   ├── types/        # Shared TypeScript types
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configs
└── docs/             # Documentation
```

## Getting Started

### Prerequisites

- Node.js ≥ 20.0.0
- pnpm ≥ 9.0.0
- PostgreSQL 16
- Redis (for job queue)

### Installation

```bash
# Install dependencies
pnpm install

# Setup database
cd packages/db
pnpm db:push

# Run development servers
pnpm dev
```

### Development

- API: http://localhost:3001
- User Dashboard: http://localhost:3000
- Admin Dashboard: http://localhost:3002

## Features

- 🔐 Authentication (email/password + Google OAuth)
- 📄 ATS-optimized CV builder with multiple templates
- 🤖 AI-powered CV screening & feedback
- 📊 Job application tracker with Kanban board
- 💳 Premium membership with Midtrans integration
- 🎮 Gamification (XP, levels, coins)
- 🔗 Referral system

## License

Private - All Rights Reserved
