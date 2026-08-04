# CUTI Dashboard

Next.js 15 dashboard application with CUTI design system.

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS 4** with CUTI design tokens
- **Glassmorphism UI** components
- **Radix UI** primitives for accessibility
- **Framer Motion** for animations
- **Lucide React** icons

## Design System

The dashboard implements the CUTI design system with:

- **Glassmorphism aesthetic** inspired by Apple VisionOS and Linear.app
- **Warm gray base** (#D7D6D5) with indigo/violet accents
- **Custom animations** with smooth easing functions
- **Accessible components** meeting WCAG 2.1 AA standards

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Development Server

The dev server runs on `http://localhost:3000`

```bash
pnpm --filter @cuti/dashboard dev
```

## Project Structure

```
apps/dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Inter font
│   ├── page.tsx           # Design system demo page
│   └── globals.css        # Global styles and design tokens
├── components/
│   ├── ui/                # Glassmorphism UI components
│   │   ├── badge.tsx      # Badge component (default, premium, status)
│   │   ├── button.tsx     # Button variants (primary, secondary, ghost)
│   │   ├── glass-card.tsx # Glass card container
│   │   ├── input.tsx      # Glass input fields
│   │   └── index.ts       # Component exports
│   └── features/          # Feature-specific components
├── lib/
│   └── utils.ts           # cn() utility for class merging
└── styles/                # Additional style modules
```

## UI Components

### GlassCard

Glass morphism card container with variants:

```tsx
import { GlassCard } from "@/components/ui";

<GlassCard variant="default" padding="md" hover>
  {children}
</GlassCard>
```

**Variants:** `default`, `medium`, `heavy`  
**Padding:** `none`, `sm`, `md`, `lg`  
**Hover:** Enable hover lift effect

### Button

Gradient and glass button variants:

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md" loading={isLoading}>
  Click Me
</Button>
```

**Variants:** `primary`, `secondary`, `ghost`, `danger`  
**Sizes:** `sm`, `md`, `lg`, `icon`

### Input

Glass input with label and error states:

```tsx
import { Input } from "@/components/ui";
import { Mail } from "lucide-react";

<Input
  label="Email"
  type="email"
  placeholder="nama@email.com"
  icon={<Mail />}
  error={errors.email}
/>
```

### Badge

Pill-style badges with variants:

```tsx
import { Badge } from "@/components/ui";
import { Crown } from "lucide-react";

<Badge variant="premium" icon={<Crown />}>
  Premium Member
</Badge>
```

**Variants:** `default`, `premium`, `success`, `warning`, `error`, `info`

## Design Tokens

All design tokens are defined in `app/globals.css` as CSS variables:

- **Colors:** `--bg-primary`, `--accent-indigo`, `--text-primary`, etc.
- **Spacing:** `--space-{1-24}` following 8px base scale
- **Border Radius:** `--radius-{sm,md,lg,xl,2xl,full}`
- **Shadows:** `--shadow-{card,button,modal,navbar}`
- **Animation:** `--ease-out`, `--ease-in-out`, `--spring`

## Animations

Built-in animation utilities:

```tsx
<div className="animate-fade-in">Fades in</div>
<div className="animate-blur-in">Blurs in</div>
<div className="animate-scale-in">Scales in</div>
<div className="animate-slide-up">Slides up</div>
```

## Typography Scale

- **Display:** 56px / Bold — Hero headings
- **H1:** 40px / Bold — Page titles
- **H2:** 32px / Semibold — Section headings
- **H3:** 24px / Semibold — Card titles
- **H4:** 20px / Semibold — Subsection headings
- **Body Large:** 18px / Regular — Landing page body
- **Body:** 16px / Regular — Default text
- **Body Small:** 14px / Regular — Metadata
- **Caption:** 12px / Medium — Labels, badges

## Color Palette

### Accent Colors
- **Indigo:** `#6366F1`
- **Violet:** `#8B5CF6`
- **Gradient:** `linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)`

### Status Colors
- **Success:** `#10B981`
- **Warning:** `#F59E0B`
- **Error:** `#EF4444`
- **Info:** `#3B82F6`

### Text Colors
- **Primary:** `#1F2937`
- **Secondary:** `#6B7280`
- **Tertiary:** `#9CA3AF`

## Accessibility

All components follow WCAG 2.1 AA standards:

- Proper color contrast ratios
- Keyboard navigation support
- Focus visible states
- Screen reader compatible
- Semantic HTML elements

## References

- [Design System Specification](../../docs/design-system.md)
- [Component Library](../../docs/component-library.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)

