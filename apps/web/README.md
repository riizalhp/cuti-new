# CUTI Landing Page

Astro 5 static landing page for CUTI - AI Career Operating System.

## Tech Stack

- **Astro 5** - Static site generation
- **Tailwind CSS** - Styling with custom design system
- **TypeScript** - Type safety
- **React** (minimal) - For interactive components only

## Design System

Glassmorphism design inspired by Apple VisionOS, Linear.app, and Arc Browser:

- **Background**: Warm gray (#D7D6D5)
- **Glass effects**: Backdrop blur with rgba overlays
- **Accents**: Indigo to Violet gradient
- **Fonts**: Inter Variable, Cal Sans (display)
- **Animation**: Smooth, purposeful, 200-400ms transitions

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Run dev server
pnpm --filter @cuti/web dev

# Build for production
pnpm --filter @cuti/web build

# Preview production build
pnpm --filter @cuti/web preview
```

Dev server runs on **http://localhost:4321**

## Project Structure

```
src/
├── pages/
│   └── index.astro          # Main landing page
├── layouts/
│   └── Layout.astro         # Base layout with SEO
├── components/
│   ├── Hero.astro           # Hero section with CTA
│   ├── Features.astro       # 6-card bento grid
│   ├── HowItWorks.astro     # 4-step timeline
│   ├── Pricing.astro        # 3-tier pricing cards
│   ├── CTA.astro            # Final conversion section
│   └── Footer.astro         # Footer with links
└── styles/
    └── global.css           # Global styles + Tailwind
```

## Performance Targets

- **Page Load**: < 1.5s
- **Lighthouse Score**: > 90
- **Static-first**: Minimal JavaScript
- **Optimized images**: Lazy loading

## Content

All copy follows `docs/page-specifications.md`:
- Hero: "AI Career Operating System untuk Pencari Kerja Indonesia"
- Features: 6 main features (CV ATS, AI Screener, Job Tracker, etc.)
- How It Works: 4-step process
- Pricing: Free, Monthly (Rp 49k), Annual (Rp 399k)

## Deployment

Built as static files in `dist/` directory. Deploy to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static host

## Accessibility

- WCAG 2.1 AA compliant colors
- Semantic HTML
- Keyboard navigation
- Screen reader support
- Focus states on all interactive elements
