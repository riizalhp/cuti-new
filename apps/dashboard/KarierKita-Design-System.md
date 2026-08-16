# KarierKita Design System

**Version**: 1.0  
**Last Updated**: 2026-07-31  
**Stack**: Next.js 14+ (App Router), Tailwind CSS 3.4+, Lucide React

---

## 1. Brand Identity

```
Name: KarierKita
Tagline: Career Portal AI
Logo: Indigo gradient lightning bolt (zap) in rounded square
```

---

## 2. Color Palette

### Light Mode
```css
--primary:       #4f46e5    /* indigo-600 */
--primary-hover: #4338ca    /* indigo-700 */
--primary-light: #eef2ff    /* indigo-50 */

--accent:        #fbbf24    /* amber-400 */
--accent-hover:  #f59e0b    /* amber-500 */

--bg:            #f8fafc    /* slate-50 */
--surface:       #ffffff
--border:        #e2e8f0    /* slate-200 */
--text:          #0f172a    /* slate-900 */
--text-muted:    #64748b    /* slate-500 */
--text-label:    #94a3b8    /* slate-400 */
```

### Dark Mode
```css
--dark-bg:       #020617    /* slate-950 */
--dark-surface:  #0f172a    /* slate-900 */
--dark-border:   #1e293b    /* slate-800 */
--dark-text:     #f8fafc    /* slate-50 */
--dark-text-muted: #64748b  /* slate-500 */
--dark-text-label: #475569  /* slate-600 */
```

### Semantic Colors
```css
--success:       #10b981    /* emerald-500 */
--success-bg:    #d1fae5    /* emerald-100 */
--error:         #ef4444    /* red-500 */
--warning:       #f59e0b    /* amber-500 */
--info:          #3b82f6    /* blue-500 */
```

---

## 3. Typography

### Font Family
```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

### Type Scale
```
Labels/Badges:   10px (0.625rem)  • font-bold uppercase tracking-wider
Small Text:      11px (0.6875rem) • leading-snug
Body:            12px (0.75rem)   • leading-normal
Card Heading:    13-14px          • font-bold
Page Heading:    16-18px          • font-bold
Hero Title:      20-24px          • font-bold tracking-tight
```

### Tailwind Config
```js
fontSize: {
  'xxs': ['10px', { lineHeight: '1.2' }],
  'xs':  ['11px', { lineHeight: '1.3' }],
  'sm':  ['12px', { lineHeight: '1.5' }],
  'base':['14px', { lineHeight: '1.5' }],
}
```

---

## 4. Spacing & Layout

### Container
```
Padding: px-4 lg:px-8 py-6
Max width: Full width (no max-w constraint)
```

### Cards
```
Padding: p-4 or p-5
Gap between cards: gap-3 to gap-3.5
```

### Sidebar
```
Desktop: w-64 (256px) sticky
Mobile:  w-72 (288px) fixed overlay with -translate-x-full when closed
```

### Border Radius
```
Cards:          rounded-[10px]  (16px)
Buttons:        rounded-[10px] (10px)
Inputs:         rounded-[10px]   (12px)
Badges:         rounded-full
Icons bg:       rounded-[10px]   (12px)
```

### Shadows
```
Card:    shadow-sm
Button:  shadow-sm or shadow-md
Premium: shadow-lg
```

---

## 5. Components

### 5.1 Button

#### Variants
```tsx
// Primary
bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm

// Accent
bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-sm

// Secondary
bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 
text-slate-600 dark:text-slate-300

// Glass
bg-white/10 dark:bg-slate-900/60 backdrop-blur-md 
border border-white/20 dark:border-slate-700/40 
text-white hover:bg-white/20 hover:border-white/30

// Outline
border border-slate-200 dark:border-slate-800 
bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800
text-slate-600 dark:text-slate-300
```

#### Sizing
```
Default: py-2 px-3 text-xs font-semibold
Small:   py-1.5 px-2.5 text-xxs font-bold
Large:   py-2.5 px-4 text-sm font-semibold
```

#### Icon Button
```tsx
<button className="flex items-center gap-1.5 ...">
  <Icon className="w-3.5 h-3.5" />
  <span>Label</span>
</button>
```

#### Implementation
```tsx
// app/components/ui/button.tsx
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
  accent: 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-sm',
  secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300',
  glass: 'bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/40 text-white hover:bg-white/20 hover:border-white/30',
  outline: 'border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
}

export const Button = forwardRef(({ variant = 'primary', className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] text-xs font-semibold transition cursor-pointer',
      variants[variant],
      className
    )}
    {...props}
  >
    {children}
  </button>
))
Button.displayName = 'Button'
```

---

### 5.2 Badge

#### Variants
```tsx
// Info (default)
bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300

// New/Highlight
bg-amber-400 text-amber-950 animate-pulse

// Success
bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300
border border-emerald-200 dark:border-emerald-800

// AI Tag
bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300

// Verified
bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300
```

#### Implementation
```tsx
// app/components/ui/badge.tsx
const colors = {
  info: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  new: 'bg-amber-400 text-amber-950 animate-pulse',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  ai: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  verified: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
}

export const Badge = ({ color = 'info', children, className }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-bold',
    colors[color],
    className
  )}>
    {children}
  </span>
)
```

---

### 5.3 Card

#### Base Card
```tsx
<div className="p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 
                bg-white dark:bg-slate-900 shadow-sm transition-colors
                hover:border-indigo-300 dark:hover:border-indigo-700">
  {/* Content */}
</div>
```

#### Gradient Card (Premium)
```tsx
<div className="relative overflow-hidden rounded-[10px] 
                bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950
                border border-indigo-700/40 p-4 text-white shadow-lg">
  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 
                  bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
  {/* Content */}
</div>
```

#### Job/Content Card
```tsx
<div className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 
                bg-slate-50/50 dark:bg-slate-800/40 
                hover:border-indigo-300 dark:hover:border-indigo-700 
                transition flex flex-col justify-between">
  {/* Header with badges */}
  {/* Content */}
  {/* Footer with CTA */}
</div>
```

#### Implementation
```tsx
// app/components/ui/card.tsx
const hoverColors = {
  indigo: 'hover:border-indigo-300 dark:hover:border-indigo-700',
  amber: 'hover:border-amber-300 dark:hover:border-amber-700',
  none: ''
}

export const Card = ({ hover = 'indigo', children, className }) => (
  <div className={cn(
    'p-4 rounded-[10px] border border-slate-200 dark:border-slate-800',
    'bg-white dark:bg-slate-900 shadow-sm transition-colors',
    hoverColors[hover],
    className
  )}>
    {children}
  </div>
)

export const CardGradient = ({ children, className }) => (
  <div className={cn(
    'relative overflow-hidden rounded-[10px]',
    'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950',
    'border border-indigo-700/40 p-4 text-white shadow-lg',
    className
  )}>
    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
    {children}
  </div>
)
```

---

### 5.4 Sidebar Navigation

#### Nav Item States
```tsx
// Active
bg-indigo-600 text-white shadow-md shadow-indigo-600/20

// Inactive
text-slate-600 dark:text-slate-300 
hover:bg-slate-100 dark:hover:bg-slate-800
```

#### Icon Animation
```tsx
<Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
```

#### Implementation
```tsx
// app/components/sidebar/nav-item.tsx
export const NavItem = ({ icon: Icon, label, badge, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex items-center rounded-[10px] text-xs font-semibold',
      'transition-all duration-200 group relative justify-between px-3.5 py-2.5',
      active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    )}
  >
    <div className="flex items-center gap-3">
      <Icon className={cn(
        'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
        active ? 'text-white' : 'text-slate-400'
      )} />
      <span className="truncate">{label}</span>
    </div>
    {badge && <Badge color={badge.color}>{badge.text}</Badge>}
  </button>
)
```

---

### 5.5 Input Fields

```tsx
// Text Input
<input className="w-full px-3 py-2 rounded-[10px] border border-slate-200 
                  dark:border-slate-800 bg-white dark:bg-slate-900
                  text-sm text-slate-900 dark:text-slate-100
                  placeholder:text-slate-400 dark:placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500" />

// Select
<select className="w-full px-3 py-2 rounded-[10px] border border-slate-200 
                   dark:border-slate-800 bg-white dark:bg-slate-900
                   text-sm text-slate-900 dark:text-slate-100
                   focus:outline-none focus:ring-2 focus:ring-indigo-500" />
```

---

### 5.6 Modal/Dialog

```tsx
// Backdrop
<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50" />

// Modal
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-white dark:bg-slate-900 rounded-[10px] shadow-2xl 
                  border border-slate-200 dark:border-slate-800 
                  max-w-md w-full p-6">
    {/* Content */}
  </div>
</div>
```

---

## 6. Icons

**Library**: Lucide React  
**CDN**: `lucide-react` npm package

### Sizing
```
Nav items:        w-4 h-4
Buttons:          w-3.5 h-3.5
Section headers:  w-5 h-5
Hero/large:       w-6 h-6 to w-10 h-10
```

### Stroke
```tsx
<Icon strokeWidth={2} />  // Default for all icons
```

### Common Icons
```
house           - Home
file-text       - CV/Documents
bot             - AI features
briefcase       - Jobs
mail            - Messages
users           - Referral/Community
sparkles        - Premium/New
zap             - Logo/Quick actions
chevron-right   - Next/Forward
x               - Close
menu            - Mobile menu
settings        - Settings
```

---

## 7. Layout Patterns

### 7.1 App Shell
```tsx
// app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 
                   transition-colors font-sans">
    <div className="h-screen overflow-hidden flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  </body>
</html>
```

### 7.2 Grid Systems

#### Job Cards (3 columns)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
  {items.map(item => <Card key={item.id} />)}
</div>
```

#### Stats (3 equal columns)
```tsx
<div className="grid grid-cols-3 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

#### Tips/Features (2 columns)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

## 8. Glassmorphism

### Usage Guidelines
Use glass effects for:
- Premium CTAs on gradient backgrounds
- Modal overlays
- Floating elements
- Sidebar on mobile (optional)

### Implementation
```css
/* Glass button */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);

/* Dark mode glass */
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(148, 163, 184, 0.2);
```

```tsx
// Tailwind
className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-md 
           border border-white/20 dark:border-slate-700/40"
```

---

## 9. Animation & Transitions

### Hover Transitions
```css
transition: all 200ms ease-in-out;
```

### Icon Scale on Hover
```tsx
className="transition-transform group-hover:scale-110"
```

### Pulse Animation (New badges)
```tsx
className="animate-pulse"
```

### Sidebar Collapse
```tsx
className="transition-all duration-300 ease-in-out"
```

---

## 10. Dark Mode Implementation

### Setup
```tsx
// app/providers/theme-provider.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const initial = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])
  
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }
  
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
```

### Toggle Button
```tsx
// app/components/theme-toggle.tsx
'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers/theme-provider'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  
  return (
    <button 
      onClick={toggle}
      className="p-2 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 
                 text-slate-600 dark:text-slate-300 transition"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
```

---

## 11. Responsive Breakpoints

```
sm:  640px   - Small tablets
md:  768px   - Tablets
lg:  1024px  - Small desktops
xl:  1280px  - Large desktops
2xl: 1536px  - Extra large screens
```

### Mobile-First Approach
```tsx
// Sidebar: hidden on mobile, visible on md+
className="hidden md:flex"

// Mobile menu button: visible on mobile, hidden on md+
className="md:hidden"

// Grid: 1 col mobile, 2 col tablet, 3 col desktop
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 12. Accessibility

### Focus States
```css
focus:outline-none 
focus:ring-2 
focus:ring-indigo-500 
focus:ring-offset-2
```

### ARIA Labels
```tsx
<button aria-label="Close menu">
  <X className="w-4 h-4" />
</button>
```

### Semantic HTML
```tsx
<nav>         // Navigation menus
<main>        // Main content
<header>      // Page/section headers
<button>      // Interactive elements (not <div> with onClick)
<section>     // Content sections
```

### Keyboard Navigation
- All interactive elements focusable with Tab
- Enter/Space triggers buttons
- Escape closes modals
- Arrow keys for dropdowns (when implemented)

---

## 13. File Structure

```
app/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── sidebar/
│   │   ├── nav-item.tsx
│   │   ├── premium-card.tsx
│   │   └── index.tsx
│   ├── header.tsx
│   └── theme-toggle.tsx
├── providers/
│   └── theme-provider.tsx
├── lib/
│   └── utils.ts              // cn() helper
├── layout.tsx
└── page.tsx

tailwind.config.js
postcss.config.js
```

---

## 14. Tailwind Config

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          light: '#eef2ff',
        },
        accent: {
          DEFAULT: '#fbbf24',
          hover: '#f59e0b',
        }
      },
      fontSize: {
        'xxs': ['10px', { lineHeight: '1.2' }],
        'xs': ['11px', { lineHeight: '1.3' }],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: []
}
```

---

## 15. Utility Helper

```ts
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Install**: `npm install clsx tailwind-merge`

---

## 16. Common Patterns

### Section Header
```tsx
<div className="flex items-center gap-2 mb-4">
  <div className="p-2 rounded-[10px] bg-indigo-50 dark:bg-indigo-950/60 
                  text-indigo-600 dark:text-indigo-400">
    <Icon className="w-5 h-5" />
  </div>
  <div>
    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
      Section Title
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Description text
    </p>
  </div>
</div>
```

### Stat Card
```tsx
<div className="text-center">
  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
    {value}
  </div>
  <div className="text-xxs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
    {label}
  </div>
</div>
```

### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
    No items yet
  </h3>
  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
    Description of empty state
  </p>
  <Button>Add First Item</Button>
</div>
```

---

## 17. Performance Guidelines

### Image Optimization
```tsx
import Image from 'next/image'

<Image 
  src="/path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
  className="rounded-[10px]"
/>
```

### Code Splitting
```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <div>Loading...</div>
})
```

### Font Loading
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

<body className={inter.className}>
```

---

## 18. Browser Support

```
Chrome/Edge:    Last 2 versions
Firefox:        Last 2 versions
Safari:         Last 2 versions
Mobile Safari:  iOS 14+
Chrome Android: Last 2 versions
```

**Fallbacks**:
- `backdrop-filter`: Graceful degradation (solid bg fallback)
- CSS Grid: Supported natively (no fallback needed)
- Dark mode: Uses `prefers-color-scheme` media query

---

## 19. Development Checklist

### Before Shipping
- [ ] Light & dark mode tested
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1440px)
- [ ] All interactive elements keyboard accessible
- [ ] Focus states visible
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states designed
- [ ] Hover states work
- [ ] ARIA labels on icon buttons
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)

---

## 20. Design Tokens (Optional)

If scaling beyond 5 devs or 100+ components, export tokens to JSON:

```json
{
  "color": {
    "primary": {
      "value": "#4f46e5"
    }
  },
  "spacing": {
    "card": {
      "value": "1rem"
    }
  },
  "radius": {
    "card": {
      "value": "1rem"
    }
  }
}
```

**Skip until**: Team > 5 or components > 100.

---

## 21. Component Library Tools (Future)

When components exceed 50 or team exceeds 3, consider:
- **Storybook**: Component documentation
- **Chromatic**: Visual regression testing
- **Radix UI**: Accessible headless components

**Not before**: Current design system is sufficient for MVP and early growth.

---

## Version History

| Version | Date       | Changes                       |
|---------|------------|-------------------------------|
| 1.0     | 2026-07-31 | Initial design system release |

---

**Maintained by**: Design & Engineering Team  
**Questions**: Open GitHub issue or Slack #design-system
