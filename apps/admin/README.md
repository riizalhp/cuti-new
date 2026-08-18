# Employr Admin Panel

Admin dashboard for the CUTI platform built with Next.js 15.

## Features

- **Dashboard Overview**: Real-time statistics and activity monitoring
- **User Management**: View and manage all platform users
- **CV Management**: Monitor generated CVs and their statuses
- **Campaign Management**: Create and track marketing campaigns
- **Settings**: System configuration and preferences

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with glassmorphism design
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

## Development

```bash
# Install dependencies (from root)
pnpm install

# Run dev server (port 3002)
pnpm --filter @cuti/admin dev

# Build for production
pnpm --filter @cuti/admin build

# Start production server
pnpm --filter @cuti/admin start
```

## Project Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── campaigns/      # Campaign management page
│   │   ├── cv/            # CV management page
│   │   ├── settings/      # Settings page
│   │   ├── users/         # User management page
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Dashboard home
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   └── admin/         # Admin-specific components
│   │       ├── AdminSidebar.tsx
│   │       ├── DataTable.tsx
│   │       └── StatsCard.tsx
│   └── lib/
│       └── utils.ts       # Utility functions
├── tailwind.config.ts     # Tailwind configuration
├── next.config.mjs        # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## Design System

The admin panel uses a glassmorphism design with:
- Purple/indigo gradient backgrounds
- Transparent cards with backdrop blur
- Admin-specific purple accent color (HSL 280 65% 60%)
- Smooth animations and transitions
- Responsive layout

## Pages

### Dashboard (`/`)
- Overview statistics (users, premium users, CVs, sessions)
- Recent activity feed
- Quick action buttons

### Users (`/users`)
- Searchable user list
- Filter by status, plan
- User status indicators

### CV Management (`/cv`)
- List of all generated CVs
- Filter by template, status
- CV status tracking

### Campaigns (`/campaigns`)
- Active/scheduled/completed campaigns
- Campaign statistics
- Participant tracking

### Settings (`/settings`)
- General settings
- Database configuration
- Email/SMTP settings
- Notification preferences
- Security settings

## Mock Data

Currently uses mock data for demonstration. API integration pending.

## Port

Development server runs on **port 3002** to avoid conflicts with other apps in the monorepo.
