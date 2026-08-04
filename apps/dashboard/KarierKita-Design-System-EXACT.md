# KarierKita Design System (EXACT CLONE)
**Scraped from:** https://karirkita-mu.vercel.app/  
**Date:** 2026-07-31  
**Stack:** Next.js 14, Tailwind CSS 4.1.11, Satoshi Font, Lucide React

---

## 1. BRAND IDENTITY

**Name:** KarierKita  
**Tagline:** Career Portal AI  
**Logo:** Indigo gradient zap icon in rounded square  
**Font:** Satoshi (400, 500, 700, 900) from Fontshare

---

## 2. COLOR PALETTE (EXACT VALUES)

### Light Mode
```css
--background: #f8fafc;        /* slate-50 */
--foreground: #0f172a;        /* slate-900 */
```

### Dark Mode
```css
--background: #090d16;        /* custom dark blue */
--foreground: #f8fafc;        /* slate-50 */
```

### Indigo (Primary)
- `indigo-50`: `oklch(96.2% .018 272.314)` → `#eef2ff`
- `indigo-100`: `oklch(93% .034 272.788)` → `#e0e7ff`
- `indigo-200`: `oklch(87% .065 274.039)` → `#c7d2ff`
- `indigo-300`: `oklch(78.5% .115 274.713)` → `#a5b4fc`
- `indigo-400`: `oklch(67.3% .182 276.935)` → `#818cf8`
- `indigo-500`: `oklch(58.5% .233 277.117)` → `#6366f1` ✓ PRIMARY
- `indigo-600`: `oklch(51.1% .262 276.966)` → `#4f46e5` ✓ PRIMARY DEFAULT
- `indigo-700`: `oklch(45.7% .24 277.023)` → `#4338ca`
- `indigo-800`: `oklch(39.8% .195 277.366)` → `#3730a3`
- `indigo-900`: `oklch(35.9% .144 278.697)` → `#312e81`
- `indigo-950`: `oklch(25.7% .09 281.288)` → `#1e1a4d`

### Amber (Accent)
- `amber-50`: `oklch(98.7% .022 95.277)` → `#fffbeb`
- `amber-100`: `oklch(96.2% .059 95.617)` → `#fef3c7`
- `amber-200`: `oklch(92.4% .12 95.746)` → `#fde68a`
- `amber-300`: `oklch(87.9% .169 91.605)` → `#fcd34d`
- `amber-400`: `oklch(82.8% .189 84.429)` → `#fbbf24` ✓ ACCENT DEFAULT
- `amber-500`: `oklch(76.9% .188 70.08)` → `#f59e0b`
- `amber-600`: `oklch(66.6% .179 58.318)` → `#d97706`
- `amber-700`: `oklch(55.5% .163 48.998)` → `#b45309`
- `amber-800`: `oklch(47.3% .137 46.201)` → `#92400e`
- `amber-900`: `oklch(41.4% .112 45.904)` → `#78350f`
- `amber-950`: `oklch(27.9% .077 45.635)` → `#451a03`

### Slate (Neutral)
- `slate-50`: `oklch(98.4% .003 247.858)` → `#f8fafc` ✓ BG LIGHT
- `slate-100`: `oklch(96.8% .007 247.896)` → `#f1f5f9`
- `slate-200`: `oklch(92.9% .013 255.508)` → `#e2e8f0`
- `slate-300`: `oklch(86.9% .022 252.894)` → `#cbd5e1`
- `slate-400`: `oklch(70.4% .04 256.788)` → `#94a3b8`
- `slate-500`: `oklch(55.4% .046 257.417)` → `#64748b`
- `slate-600`: `oklch(44.6% .043 257.281)` → `#475569`
- `slate-700`: `oklch(37.2% .044 257.287)` → `#334155`
- `slate-800`: `oklch(27.9% .041 260.031)` → `#1e293b`
- `slate-900`: `oklch(20.8% .042 265.755)` → `#0f172a` ✓ TEXT LIGHT
- `slate-950`: `oklch(12.9% .042 264.695)` → `#020617`

### Emerald (Success)
- `emerald-100`: `#d1fae5`
- `emerald-300`: `#6ee7b7`
- `emerald-800`: `#065f46`

### Rose (Error)
- `rose-500`: `#f43f5e`

---

## 3. TYPOGRAPHY

### Font Stack
```css
font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Size Scale (Exact from CSS)
```css
--text-xs: 0.75rem;      /* 12px */  line-height: 1.333
--text-sm: 0.875rem;     /* 14px */  line-height: 1.428
--text-base: 1rem;       /* 16px */  line-height: 1.5
--text-lg: 1.125rem;     /* 18px */  line-height: 1.555
--text-xl: 1.25rem;      /* 20px */  line-height: 1.4
--text-2xl: 1.5rem;      /* 24px */  line-height: 1.333
--text-3xl: 1.875rem;    /* 30px */  line-height: 1.2
```

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

### Usage Map (from HTML)
- **Badge label** → `text-[10px]` (10px) + `font-bold` + `uppercase` + `tracking-wider`
- **Small caption** → `text-[11px]` (11px) + `leading-snug`
- **Body/button** → `text-xs` (12px) + `font-semibold`
- **Card heading** → `text-xs` (12px) + `font-bold`
- **Section heading** → `text-sm` (14px) + `font-bold`
- **Page title** → `text-xl` (20px) + `font-bold` + `tracking-tight`

---

## 4. SPACING SYSTEM

```css
--spacing: 0.25rem;  /* Base unit = 4px */
```

### Common Values (from HTML inspection)
- **Sidebar padding** → `p-4` (16px), `py-4 px-3` (16px/12px)
- **Card padding** → `p-4` (16px), `p-5` (20px)
- **Button padding** → `py-2 px-3` (8px/12px), `py-2.5 px-3.5` (10px/14px)
- **Badge padding** → `px-2 py-0.5` (8px/2px)
- **Gap grid** → `gap-3.5` (14px) for job cards
- **Gap nav** → `space-y-1.5` (6px) for menu items

---

## 5. BORDER RADIUS

```css
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */   ✓ PRIMARY (buttons, nav, cards)
--radius-2xl: 1rem;       /* 16px */   ✓ CARD DEFAULT
--radius-3xl: 1.5rem;     /* 24px */
```

### Usage
- **Logo square** → `rounded-xl` (12px)
- **Buttons** → `rounded-xl` (12px)
- **Nav items** → `rounded-xl` (12px)
- **Cards** → `rounded-xl` (12px), `rounded-2xl` (16px) for sections
- **Badges** → `rounded-full` (9999px)

---

## 6. SHADOWS

### From CSS
```css
--tw-shadow: 0 0 #0000;
```

### Usage (from HTML)
- **Button/card** → `shadow-sm` → `0 1px 2px rgba(0,0,0,0.05)`
- **Active nav** → `shadow-md` → `0 4px 6px -1px rgba(79,70,229,0.2)` (indigo tint)
- **Premium card** → `shadow-lg` → `0 10px 15px -3px rgba(0,0,0,0.1)`
- **Mobile sidebar** → `shadow-2xl`

---

## 7. COMPONENTS (EXACT HTML STRUCTURE)

### 7.1 SIDEBAR NAV ITEM

#### Active State
```html
<button class="w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group relative justify-between px-3.5 py-2.5 bg-indigo-600 text-white shadow-md shadow-indigo-600/20 dark:bg-indigo-500">
  <div class="flex items-center gap-3">
    <svg class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-white">...</svg>
    <span class="truncate">Beranda</span>
  </div>
</button>
```

#### Inactive State
```html
<button class="w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group relative justify-between px-3.5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
  <div class="flex items-center gap-3">
    <svg class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-slate-400 dark:text-slate-400">...</svg>
    <span class="truncate">CV Saya</span>
  </div>
</button>
```

#### With Badge
```html
<button class="...">
  <div class="flex items-center gap-3">
    <svg>...</svg>
    <span class="truncate">AI CV Screener</span>
  </div>
  <span class="font-bold rounded-full transition-all px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">HRD</span>
</button>
```

### 7.2 BADGE

#### Info/Count
```html
<span class="font-bold rounded-full transition-all px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">4</span>
```

#### New (Pulsing)
```html
<span class="font-bold rounded-full transition-all px-2 py-0.5 text-[10px] bg-amber-400 text-amber-950 dark:bg-amber-400 dark:text-amber-950 animate-pulse">Baru</span>
```

#### Success/Verified
```html
<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
  <svg class="w-3 h-3 text-emerald-600 dark:text-emerald-400">...</svg>
  Google Verified
</span>
```

#### AI
```html
<span class="font-bold rounded-full transition-all px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">AI</span>
```

### 7.3 BUTTON

#### Primary
```html
<button class="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
  <svg class="w-3.5 h-3.5">...</svg>
  <span>Daftar Acara (Gratis)</span>
</button>
```

#### Accent
```html
<button class="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer">
  <span>Upgrade Sekarang</span>
  <svg class="w-3.5 h-3.5">...</svg>
</button>
```

#### Secondary/Ghost
```html
<button class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-semibold transition-colors cursor-pointer border bg-white dark:bg-slate-900 p-0 h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
  <svg class="w-5 h-5">...</svg>
</button>
```

### 7.4 CARD

#### Standard Card
```html
<div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
  <!-- content -->
</div>
```

#### Section Card (White)
```html
<div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
  <!-- content -->
</div>
```

#### Premium Gradient Card
```html
<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-4 text-white shadow-lg border border-indigo-700/40">
  <div class="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>
  <!-- content -->
</div>
```

### 7.5 JOB CARD (Complete)
```html
<div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col justify-between">
  <div>
    <div class="flex items-center justify-between mb-2">
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Job Fair</span>
      <span class="text-[10px] text-slate-400 font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">Gratis Tiket</span>
    </div>
    <h4 class="font-bold text-xs text-slate-900 dark:text-white mb-1">National Virtual Job Fair 2026</h4>
    <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3">Penyelenggara: KarierKita & Kemenaker</p>
    <div class="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
      <div class="flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-indigo-500 flex-shrink-0">...</svg>
        <span>28 - 30 Juli 2026</span>
      </div>
      <!-- more rows -->
    </div>
    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Description...</p>
  </div>
  <button class="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
    <svg class="w-3.5 h-3.5 text-amber-300">...</svg>
    <span>Daftar Acara (Gratis)</span>
  </button>
</div>
```

---

## 8. LAYOUT

### Sidebar
```css
width: 256px;              /* w-64 desktop */
width: 288px;              /* w-72 mobile overlay */
position: fixed;
transform: translateX(-100%);  /* mobile hidden */
@media (min-width: 768px) {
  transform: translateX(0);
}
```

### Header
```css
position: sticky;
top: 0;
z-index: 30;
background: white/90;
backdrop-filter: blur(12px);
padding: 14px 32px;        /* py-3.5 px-4 lg:px-8 */
border-bottom: 1px solid slate-200;
```

### Main Content
```css
max-width: 1536px;         /* max-w-7xl */
margin: 0 auto;
padding: 24px 32px;        /* py-6 px-4 lg:px-8 */
```

### Grid - Job Cards
```css
display: grid;
grid-template-columns: 1fr;
gap: 14px;                 /* gap-3.5 */

@media (min-width: 768px) {
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 1024px) {
  grid-template-columns: repeat(3, 1fr);
}
```

### Grid - Stats (3 equal columns)
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 16px;                 /* gap-4 */
```

---

## 9. ANIMATIONS

### Pulse (Baru badge)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

### Hover Scale (Icons)
```css
.group:hover svg {
  transform: scale(1.1);
}
transition: transform 200ms;
```

### Transitions
```css
transition: all 200ms;           /* buttons, cards */
transition-colors: 150ms;        /* color changes */
transition-all: duration-300;    /* sidebar */
```

---

## 10. GLASSMORPHISM

### Used in Premium Card Glow Effect
```css
background: rgba(251, 191, 36, 0.2);  /* amber-400/20 */
filter: blur(40px);
border-radius: 50%;
```

### Backdrop Blur (Header)
```css
background: rgba(255, 255, 255, 0.9);
backdrop-filter: blur(12px);
```

---

## 11. DARK MODE IMPLEMENTATION

### Toggle Class
```javascript
document.documentElement.classList.toggle('dark');
```

### CSS Selectors
```css
.dark\:bg-slate-900:where(.dark, .dark *) {
  background-color: var(--color-slate-900);
}
```

### Key Dark Mode Overrides
- Background: `slate-950` (#020617) → custom `#090d16`
- Surface: `slate-900` (#0f172a)
- Border: `slate-800` (#1e293b)
- Text: `slate-100` (#f1f5f9)
- Muted text: `slate-400` (#94a3b8)

---

## 12. ICON SYSTEM (Lucide React)

### Sizes
```css
w-3 h-3    →  12px  (badge icons)
w-3.5 h-3.5 → 14px  (button icons)
w-4 h-4    →  16px  (nav icons)
w-5 h-5    →  20px  (section icons, header)
```

### Common Icons
- `zap` → Logo
- `house` → Beranda
- `file-text` → CV
- `bot` → AI features
- `file-check` → Match CV
- `mail` → Surat Lamaran
- `briefcase` → Tracker
- `mic` → Interview
- `linkedin` → LinkedIn
- `target` → Misi
- `users` → Referral
- `trending-up` → Career Readiness
- `palette` → Panduan Desain
- `settings` → Pengaturan
- `sparkles` → Premium
- `chevron-right` → Arrow
- `menu` → Mobile menu
- `panel-left-close` → Sidebar toggle
- `calendar`, `clock`, `map-pin` → Event details
- `shield-check` → Verified
- `award` → Certification
- `ticket` → Event ticket

---

## 13. BREAKPOINTS

```css
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## 14. Z-INDEX LAYERS

```css
z-10  →  glow effects, decorative elements
z-30  →  sticky header
z-40  →  ?
z-50  →  sidebar (mobile overlay)
```

---

## 15. ACCESSIBILITY

### Focus States
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-indigo-500
```

### ARIA Labels
```html
aria-label="Tutup Menu"
aria-label="Toggle Sidebar"
aria-hidden="true"  (decorative icons)
```

### Semantic HTML
- `<nav>` for sidebar navigation
- `<header>` for top bar
- `<main>` for content area
- `<button>` for interactive elements
- `<section>` for content blocks

---

## 16. PERFORMANCE

### Font Loading
```css
@import "https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap";
```

### Image Optimization
- SVG icons (inline)
- No external image assets on homepage

### CSS Strategy
- Tailwind 4.1.11 with compiled output
- Single CSS file (136KB gzipped)

---

## 17. FILE STRUCTURE (Inferred from Next.js)

```
app/
├── layout.tsx
├── page.tsx
├── globals.css
└── components/
    ├── sidebar/
    │   ├── nav-item.tsx
    │   └── sidebar.tsx
    ├── ui/
    │   ├── button.tsx
    │   ├── badge.tsx
    │   └── card.tsx
    └── theme-toggle.tsx
```

---

## 18. KEY DIFFERENCES FROM GENERIC TAILWIND

1. **Custom dark background** → `#090d16` not standard Tailwind
2. **Satoshi font** → Premium font from Fontshare
3. **Rounded-xl default** → Not rounded-lg
4. **Indigo-600 primary** → Not indigo-500
5. **Amber-400 accent** → Not yellow
6. **Text sizes** → Heavy use of `text-[10px]`, `text-[11px]` (non-standard)
7. **Spacing** → `gap-3.5` (14px) for cards
8. **Padding** → `px-3.5 py-2.5` for nav items (non-standard combo)

---

## 19. COMPONENT CHECKLIST

✓ Sidebar navigation (active/inactive states)  
✓ Badge variants (info, new, AI, verified)  
✓ Button variants (primary, accent, secondary)  
✓ Card variants (standard, section, premium gradient)  
✓ Job card (complete with metadata rows)  
✓ Header with backdrop blur  
✓ Theme toggle  
✓ Mobile sidebar overlay  
✓ Grid layouts (2-col, 3-col, 3-equal)  
✓ Icon system  
✓ Dark mode  

---

## 20. REPRODUCTION GUIDE

### Step 1: Install Dependencies
```bash
npm install tailwindcss@4.1.11 lucide-react
```

### Step 2: Import Satoshi Font
```css
@import "https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap";
```

### Step 3: Configure Tailwind
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        accent: '#fbbf24',
      },
      fontFamily: {
        sans: ['Satoshi', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
};
```

### Step 4: Use Exact Classes
Copy HTML structure from sections 7.1-7.5 with exact Tailwind classes.

### Step 5: Dark Mode Setup
```typescript
const [theme, setTheme] = useState('light');
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}, [theme]);
```

---

**END OF EXACT DESIGN SYSTEM**

Scraped: 2026-07-31  
Source: https://karirkita-mu.vercel.app/  
HTML: 188KB, CSS: 137KB compiled Tailwind 4.1.11
