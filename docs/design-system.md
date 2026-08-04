# CUTI — Design System Specification

**Version:** 1.0  
**Last Updated:** 2026-07-30  
**Design Philosophy:** Luxury SaaS with Glassmorphism, inspired by Apple VisionOS, Linear.app, Arc Browser, Nothing

---

## Overview

CUTI's design system creates a premium, modern aesthetic that positions the platform as a high-end career tool. The system leverages glassmorphism, warm neutrals, and purposeful animation to create clarity, elegance, and sophistication.

---

## 1. Color Palette

### 1.1 Base Colors

**Primary Background**
- `#D7D6D5` (Warm Gray) — Main canvas color

**Glass Overlays**
- `rgba(255, 255, 255, 0.1)` — Light glass
- `rgba(255, 255, 255, 0.15)` — Medium glass (navbar)
- `rgba(255, 255, 255, 0.25)` — Heavy glass (modals)

**Glass Borders**
- `rgba(255, 255, 255, 0.18)` — Standard border
- `rgba(255, 255, 255, 0.2)` — Emphasized border

**Shadows**
- `rgba(0, 0, 0, 0.05)` — Subtle depth
- `rgba(0, 0, 0, 0.1)` — Medium depth
- `rgba(0, 0, 0, 0.15)` — Deep depth

### 1.2 Accent Colors

**Indigo/Violet Gradient System**
- **Primary Accent:** `#6366F1` (Indigo-500)
- **Secondary Accent:** `#8B5CF6` (Violet-500)
- **Gradient CTA:** `linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)`
- **Hover State:** `#4F46E5` (Indigo-600)
- **Active State:** `#4338CA` (Indigo-700)

### 1.3 Text Colors

**Hierarchy**
- **Primary:** `#1F2937` (Gray-800) — Headings, main content
- **Secondary:** `#6B7280` (Gray-500) — Subtext, metadata
- **Tertiary:** `#9CA3AF` (Gray-400) — Hints, placeholders
- **On-Accent:** `#FFFFFF` — Text on colored backgrounds

### 1.4 Status Colors

**Feedback States**
- **Success:** `#10B981` (Green-500)
- **Warning:** `#F59E0B` (Amber-500)
- **Error:** `#EF4444` (Red-500)
- **Info:** `#3B82F6` (Blue-500)
- **Neutral:** `#6B7280` (Gray-500)

### 1.5 Semantic Applications

**ATS Score Colors**
- **Excellent (80-100):** `#10B981` (Green)
- **Borderline (60-79):** `#F59E0B` (Amber)
- **Needs Improvement (0-59):** `#EF4444` (Red)

**Application Status Colors**
- **Terkirim (Sent):** `#3B82F6` (Blue)
- **Screening:** `#8B5CF6` (Violet)
- **Interview:** `#6366F1` (Indigo)
- **Offering:** `#10B981` (Green)
- **Ditolak (Rejected):** `#EF4444` (Red)

**Premium Badge**
- **Gradient:** `linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)` (Gold)

---

## 2. Typography

### 2.1 Font Stack

```css
--font-sans: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Cal Sans', 'Inter Variable', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 2.2 Type Scale

| Name | Size | Line Height | Letter Spacing | Weight | Usage |
|------|------|-------------|----------------|--------|-------|
| **Display** | 56px | 64px | -0.02em | 700 | Hero headings |
| **H1** | 40px | 48px | -0.01em | 700 | Page titles |
| **H2** | 32px | 40px | -0.01em | 600 | Section headings |
| **H3** | 24px | 32px | 0em | 600 | Card titles |
| **H4** | 20px | 28px | 0em | 600 | Subsection headings |
| **Body Large** | 18px | 28px | 0em | 400 | Landing page body |
| **Body** | 16px | 24px | 0em | 400 | Default text |
| **Body Small** | 14px | 20px | 0em | 400 | Metadata, captions |
| **Caption** | 12px | 16px | 0.01em | 500 | Labels, badges |

### 2.3 Font Weights

- **700 (Bold)** — Hero text, primary CTA
- **600 (Semibold)** — Headings, emphasis
- **500 (Medium)** — Labels, navigation
- **400 (Regular)** — Body text

---

## 3. Spacing System

### 3.1 Spacing Scale (8px base)

```css
--space-1: 4px;    /* 0.5 × 8px */
--space-2: 8px;    /* 1 × 8px */
--space-3: 12px;   /* 1.5 × 8px */
--space-4: 16px;   /* 2 × 8px */
--space-5: 20px;   /* 2.5 × 8px */
--space-6: 24px;   /* 3 × 8px */
--space-8: 32px;   /* 4 × 8px */
--space-10: 40px;  /* 5 × 8px */
--space-12: 48px;  /* 6 × 8px */
--space-16: 64px;  /* 8 × 8px */
--space-20: 80px;  /* 10 × 8px */
--space-24: 96px;  /* 12 × 8px */
```

### 3.2 Layout Grid

- **Container Max Width:** 1280px (xl breakpoint)
- **Dashboard Grid:** 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- **Grid Gap:** 24px (desktop), 16px (mobile)
- **Container Padding:** 80px horizontal (desktop), 24px (mobile)

---

## 4. Border Radius

| Name | Value | Usage |
|------|-------|-------|
| **Small** | 8px | Small badges, buttons |
| **Medium** | 12px | Standard buttons, inputs |
| **Large** | 16px | Small cards |
| **XL** | 24px | Modals, large cards |
| **2XL** | 28px | Glass cards |
| **Full** | 9999px | Pills, navbar, badges |

---

## 5. Shadows

### 5.1 Elevation System

```css
/* Card Shadow */
--shadow-card: 
  0 4px 6px rgba(0, 0, 0, 0.05),
  0 10px 15px rgba(0, 0, 0, 0.1),
  inset 0 1px 0 rgba(255, 255, 255, 0.3);

/* Button Shadow */
--shadow-button: 
  0 4px 6px rgba(99, 102, 241, 0.2),
  0 1px 3px rgba(0, 0, 0, 0.1);

/* Button Hover Shadow */
--shadow-button-hover: 
  0 6px 12px rgba(99, 102, 241, 0.3),
  0 2px 4px rgba(0, 0, 0, 0.15);

/* Modal Shadow */
--shadow-modal: 
  0 20px 25px rgba(0, 0, 0, 0.1),
  0 10px 10px rgba(0, 0, 0, 0.04);

/* Floating Navbar Shadow */
--shadow-navbar: 
  0 4px 6px rgba(0, 0, 0, 0.05),
  0 10px 15px rgba(0, 0, 0, 0.1);
```

---

## 6. Animation System

### 6.1 Core Principles

- **Subtle:** No jarring movements
- **Purposeful:** Animation provides feedback or guides attention
- **Smooth:** Ease curves feel natural
- **Fast:** Animations complete within 200-400ms

### 6.2 Easing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* Fast start, smooth end */
--ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);  /* Balanced */
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);    /* Subtle bounce */
```

### 6.3 Animation Duration

- **Fast:** 150ms — Hover states, focus rings
- **Standard:** 200ms — Button presses, toggles
- **Medium:** 300ms — Fade in/out, scale
- **Slow:** 400ms — Slide in, blur in

### 6.4 Animation Patterns

**Fade In**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Duration: 300ms, ease-out */
```

**Blur In**
```css
@keyframes blurIn {
  from { 
    opacity: 0; 
    filter: blur(10px);
  }
  to { 
    opacity: 1; 
    filter: blur(0);
  }
}
/* Duration: 400ms, ease-out */
```

**Scale In**
```css
@keyframes scaleIn {
  from { 
    opacity: 0; 
    transform: scale(0.95);
  }
  to { 
    opacity: 1; 
    transform: scale(1);
  }
}
/* Duration: 300ms, spring */
```

**Slide Up**
```css
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
}
/* Duration: 400ms, ease-out */
```

**Hover Lift**
```css
.card:hover {
  transform: translateY(-4px) scale(1.01);
  transition: transform 200ms var(--ease-out);
}
```

### 6.5 Loading States

**Skeleton Shimmer**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

**Spinner**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366F1;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
}
```

---

## 7. Breakpoints

### 7.1 Responsive Grid

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Tablet portrait */
--breakpoint-md: 768px;   /* Tablet landscape */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large desktop */
```

### 7.2 Usage Guidelines

- **Mobile (< 640px):** Single column, stacked cards, hamburger menu
- **Tablet (640px - 1023px):** 2-column grid, hybrid navigation
- **Desktop (≥ 1024px):** 3-column bento grid, full navigation
- **Large Desktop (≥ 1280px):** Maximum container width, enhanced spacing

---

## 8. Accessibility

### 8.1 Color Contrast

All text-background combinations meet **WCAG 2.1 AA** standards:
- **Normal text (< 18px):** Minimum 4.5:1 contrast ratio
- **Large text (≥ 18px or bold ≥ 14px):** Minimum 3:1 contrast ratio

### 8.2 Focus States

```css
.focusable:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: inherit;
}
```

### 8.3 Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order follows visual hierarchy
- Skip navigation link for screen readers
- Arrow keys for navigation in complex components (kanban, carousels)

### 8.4 Screen Reader Support

- Semantic HTML elements (`<nav>`, `<main>`, `<article>`)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content updates
- Alt text for all images

---

## 9. Implementation Notes

### 9.1 CSS Architecture

**Approach:** Utility-first (Tailwind CSS) + Custom Components

**File Structure:**
```
styles/
├── globals.css           # CSS variables, resets
├── components/           # Component-specific styles
│   ├── glass-card.css
│   ├── glass-navbar.css
│   └── buttons.css
└── animations.css        # Keyframes, transitions
```

### 9.2 Dark Mode (Future)

Glass effect adjustments for dark mode:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1F2937;
    --glass-overlay: rgba(0, 0, 0, 0.3);
    --glass-border: rgba(255, 255, 255, 0.1);
    --text-primary: #F9FAFB;
  }
}
```

### 9.3 Performance Considerations

- Use `backdrop-filter: blur()` sparingly (GPU-intensive)
- Prefer `transform` and `opacity` for animations (hardware-accelerated)
- Lazy load images and heavy components
- Optimize glassmorphism for mobile (reduce blur radius)

---

## 10. Design Tokens (JSON)

```json
{
  "colors": {
    "background": {
      "primary": "#D7D6D5",
      "glass": {
        "light": "rgba(255, 255, 255, 0.1)",
        "medium": "rgba(255, 255, 255, 0.15)",
        "heavy": "rgba(255, 255, 255, 0.25)"
      }
    },
    "accent": {
      "indigo": "#6366F1",
      "violet": "#8B5CF6",
      "gradient": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
    },
    "text": {
      "primary": "#1F2937",
      "secondary": "#6B7280",
      "tertiary": "#9CA3AF"
    },
    "status": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444",
      "info": "#3B82F6"
    }
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px",
    "12": "48px",
    "16": "64px"
  },
  "borderRadius": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "2xl": "28px",
    "full": "9999px"
  },
  "animation": {
    "duration": {
      "fast": "150ms",
      "standard": "200ms",
      "medium": "300ms",
      "slow": "400ms"
    },
    "easing": {
      "easeOut": "cubic-bezier(0.16, 1, 0.3, 1)",
      "easeInOut": "cubic-bezier(0.45, 0, 0.55, 1)",
      "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)"
    }
  }
}
```

---

## References

- [Apple VisionOS Design Language](https://developer.apple.com/design/human-interface-guidelines/visionos)
- [Linear.app Design System](https://linear.app/method)
- [Arc Browser Aesthetic](https://arc.net)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
