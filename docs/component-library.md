# CUTI — Component Library

**Version:** 1.0  
**Last Updated:** 2026-07-30  
**Framework:** React + Tailwind CSS + Framer Motion

---

## Overview

This document specifies all reusable UI components in the CUTI design system. Each component follows the glassmorphism aesthetic with detailed implementation specs.

---

## 1. Glass Card

### 1.1 Base Glass Card

**Visual Specs:**
- Background: `rgba(255, 255, 255, 0.1)`
- Backdrop filter: `blur(16px) saturate(180%)`
- Border: `1px solid rgba(255, 255, 255, 0.18)`
- Border radius: `28px`
- Shadow: Multi-layer (see design-system.md)

**Component API:**
```tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean; // Enable hover lift effect
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

<GlassCard padding="md" hover>
  {children}
</GlassCard>
```

**CSS Implementation:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 28px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.glass-card--hover:hover {
  transform: translateY(-4px) scale(1.01);
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Usage:**
- Dashboard cards
- Feature cards on landing page
- Content containers

---

## 2. Glass Navbar (Floating Pill)

### 2.1 Desktop Navbar

**Visual Specs:**
- Background: `rgba(255, 255, 255, 0.15)`
- Backdrop filter: `blur(20px) saturate(180%)`
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Border radius: `9999px` (full pill)
- Padding: `12px 24px`
- Position: Fixed, 80px from top, centered horizontally

**Component API:**
```tsx
interface NavbarProps {
  logo: React.ReactNode;
  links: { label: string; href: string; active?: boolean }[];
  userMenu: React.ReactNode;
}

<GlassNavbar 
  logo={<Logo />}
  links={navLinks}
  userMenu={<UserDropdown />}
/>
```

**Structure:**
```html
<nav class="glass-navbar">
  <div class="navbar-logo">
    <!-- Logo -->
  </div>
  <div class="navbar-links">
    <!-- Navigation links -->
  </div>
  <div class="navbar-user">
    <!-- User avatar + premium badge -->
  </div>
</nav>
```

**Responsive:**
- Desktop: Full horizontal pill
- Mobile: Hamburger menu → slide-in drawer

---

## 3. Buttons

### 3.1 Primary Button (Gradient CTA)

**Visual Specs:**
- Background: `linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)`
- Color: `#FFFFFF`
- Border radius: `12px`
- Padding: `12px 24px`
- Font weight: `600`
- Shadow: `0 4px 6px rgba(99, 102, 241, 0.2)`

**States:**
- Hover: `translateY(-2px)` + enhanced shadow
- Active: `scale(0.98)`
- Disabled: `opacity: 0.5` + `cursor: not-allowed`

**Component API:**
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

<Button variant="primary" size="md" loading={isLoading}>
  Mulai Gratis
</Button>
```

### 3.2 Secondary Button (Glass)

**Visual Specs:**
- Background: `rgba(255, 255, 255, 0.1)`
- Backdrop filter: `blur(12px)`
- Border: `1px solid rgba(255, 255, 255, 0.18)`
- Color: `#1F2937`

**States:**
- Hover: `background: rgba(255, 255, 255, 0.15)` + `scale(1.02)`

### 3.3 Ghost Button

**Visual Specs:**
- Background: `transparent`
- Color: `#6366F1`
- No border

**States:**
- Hover: `background: rgba(99, 102, 241, 0.1)` + `border-radius: 12px`

### 3.4 Icon Button

**Visual Specs:**
- Size: `40px × 40px`
- Border radius: `12px` (medium) or `9999px` (circle)
- Padding: `8px`

**Usage:**
- Close buttons
- Action icons in cards
- Navigation icons

---

## 4. Inputs

### 4.1 Glass Text Input

**Visual Specs:**
- Background: `rgba(255, 255, 255, 0.08)`
- Backdrop filter: `blur(12px)`
- Border: `1px solid rgba(255, 255, 255, 0.12)`
- Border radius: `16px`
- Padding: `12px 16px`
- Font size: `16px`

**States:**
- Focus: `background: rgba(255, 255, 255, 0.12)` + indigo border + focus ring
- Error: Red border + error message below
- Disabled: `opacity: 0.6`

**Component API:**
```tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

<GlassInput 
  label="Email"
  placeholder="nama@email.com"
  error={errors.email}
  icon={<MailIcon />}
/>
```

### 4.2 Textarea

**Visual Specs:**
- Same as text input
- Min height: `120px`
- Auto-resize: Optional prop

### 4.3 Select Dropdown

**Visual Specs:**
- Base: Same as text input
- Dropdown: Glass card with blur effect
- Options: Hover highlight with indigo background

### 4.4 File Upload

**Visual Specs:**
- Drag-drop zone with dashed glass border
- Icon: Upload cloud icon
- Label: "Drag & drop or click to upload"
- Accepted formats below

---

## 5. Badges

### 5.1 Standard Badge (Pill)

**Visual Specs:**
- Background: `rgba(255, 255, 255, 0.15)`
- Backdrop filter: `blur(8px)`
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Border radius: `9999px`
- Padding: `4px 12px`
- Font size: `12px`
- Font weight: `500`

**Component API:**
```tsx
interface BadgeProps {
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

<Badge variant="premium">Premium Member</Badge>
```

### 5.2 Status Badge

**Variants:**
- Success: Green background
- Warning: Amber background
- Error: Red background
- Info: Blue background

### 5.3 Premium Badge

**Visual Specs:**
- Background: `linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)`
- Color: `#FFFFFF`
- Icon: Crown or sparkle

---

## 6. Modal/Dialog

### 6.1 Modal Overlay

**Visual Specs:**
- Background: `rgba(0, 0, 0, 0.4)`
- Backdrop filter: `blur(4px)`
- Z-index: `1000`

### 6.2 Modal Content

**Visual Specs:**
- Background: `rgba(255, 255, 255, 0.95)`
- Backdrop filter: `blur(40px) saturate(180%)`
- Border: `1px solid rgba(255, 255, 255, 0.3)`
- Border radius: `24px`
- Padding: `32px`
- Shadow: Deep multi-layer

**Component API:**
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

<Modal isOpen={showModal} onClose={handleClose} title="Modal Title" size="md">
  {content}
</Modal>
```

**Structure:**
```html
<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Title</h3>
      <button class="close-button">×</button>
    </div>
    <div class="modal-body">
      {children}
    </div>
    <div class="modal-footer">
      {actions}
    </div>
  </div>
</div>
```

**Animation:**
- Enter: Scale in (0.95 → 1) + fade in
- Exit: Fade out

---

## 7. Bento Grid

### 7.1 Container

**Visual Specs:**
- Display: CSS Grid
- Gap: `24px` (desktop), `16px` (mobile)
- Columns: `repeat(3, 1fr)` (desktop), `repeat(2, 1fr)` (tablet), `1fr` (mobile)

**Component API:**
```tsx
interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

<BentoGrid>
  <BentoCard span="2x1">...</BentoCard>
  <BentoCard span="1x1">...</BentoCard>
  <BentoCard span="3x1">...</BentoCard>
</BentoGrid>
```

### 7.2 Bento Card

**Visual Specs:**
- Base: Glass card styling
- Grid span: Configurable (1x1, 2x1, 3x1, 1x2, 2x2)

**Responsive:**
- Desktop: Maintain span
- Tablet: Collapse to 2x1 or 1x1
- Mobile: All cards 1x1

---

## 8. Progress Indicators

### 8.1 Circular Progress

**Visual Specs:**
- Ring: SVG circle with gradient stroke
- Size: `60px` (small), `100px` (medium), `120px` (large)
- Stroke width: `8px`
- Background ring: `rgba(255, 255, 255, 0.1)`
- Progress ring: Indigo gradient

**Component API:**
```tsx
interface CircularProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
}

<CircularProgress value={78} size="lg" label="ATS Score" showValue />
```

### 8.2 Linear Progress Bar

**Visual Specs:**
- Height: `8px`
- Background: `rgba(255, 255, 255, 0.1)`
- Fill: Gradient or solid color
- Border radius: `9999px`

**Component API:**
```tsx
interface ProgressBarProps {
  value: number; // 0-100
  color?: 'indigo' | 'green' | 'amber' | 'red';
  label?: string;
}

<ProgressBar value={65} color="indigo" label="Career Readiness" />
```

### 8.3 Skeleton Loader

**Visual Specs:**
- Background: Glass card with shimmer animation
- Shapes: Rectangle, circle, text lines

**Animation:**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 9. Kanban Board

### 9.1 Kanban Column

**Visual Specs:**
- Width: `280px` (fixed)
- Background: `rgba(255, 255, 255, 0.05)`
- Border radius: `16px`
- Padding: `16px`

**Header:**
- Title + count badge
- Add button (icon only)

### 9.2 Kanban Card

**Visual Specs:**
- Size: `280px × 160px`
- Background: Glass card
- Padding: `16px`

**Content:**
- Company logo (40px circle, top-left)
- Position title (H4, max 2 lines)
- Location (caption, gray)
- Applied date (caption, gray)
- Match score badge (optional)

**Drag Handle:**
- Icon: Six dots (vertical)
- Position: Left edge
- Visible on hover

**Component API:**
```tsx
interface KanbanCardProps {
  job: {
    company: string;
    position: string;
    location: string;
    appliedDate: string;
    matchScore?: number;
  };
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}
```

---

## 10. CV Preview Component

### 10.1 A4 Preview Container

**Visual Specs:**
- Aspect ratio: `210:297` (A4 paper)
- Background: `#FFFFFF`
- Shadow: Deep paper shadow
- Border: `1px solid #E5E7EB`

**Controls:**
- Zoom: 50%, 75%, 100%, 125%
- Download button
- Print button

**Component API:**
```tsx
interface CVPreviewProps {
  cvData: CVData;
  templateId: string;
  zoom?: number;
  onDownload: () => void;
}

<CVPreview cvData={data} templateId="ats-modern" zoom={100} />
```

---

## 11. Toast Notifications

### 11.1 Toast

**Visual Specs:**
- Background: Glass card (darker for contrast)
- Border radius: `16px`
- Padding: `16px 20px`
- Max width: `400px`
- Position: Top-right or bottom-right

**Variants:**
- Success: Green accent bar on left
- Error: Red accent bar
- Warning: Amber accent bar
- Info: Blue accent bar

**Component API:**
```tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss after ms
  action?: { label: string; onClick: () => void };
}

toast.success('CV berhasil disimpan!', { duration: 3000 });
```

**Animation:**
- Enter: Slide in from right + fade in
- Exit: Slide out to right + fade out

---

## 12. Dropdown Menu

### 12.1 Dropdown

**Visual Specs:**
- Trigger: Button or icon button
- Menu: Glass card
- Border radius: `16px`
- Padding: `8px`
- Shadow: Medium depth

**Menu Item:**
- Padding: `10px 16px`
- Border radius: `8px`
- Hover: Indigo background `rgba(99, 102, 241, 0.1)`

**Component API:**
```tsx
interface DropdownProps {
  trigger: React.ReactNode;
  items: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }[];
}

<Dropdown 
  trigger={<Button>Actions</Button>}
  items={menuItems}
/>
```

---

## 13. Tabs

### 13.1 Horizontal Tabs

**Visual Specs:**
- Container: Border bottom `1px solid rgba(255, 255, 255, 0.12)`
- Tab: Padding `12px 24px`
- Active: Indigo text + bottom border `2px solid #6366F1`
- Inactive: Gray text, hover indigo

**Component API:**
```tsx
interface TabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
}

<Tabs tabs={tabData} defaultTab="overview" />
```

### 13.2 Segmented Control

**Visual Specs:**
- Container: Glass background, pill shape
- Segment: Padding `8px 16px`
- Active: Solid gradient background
- Inactive: Transparent

**Usage:**
- View toggles (Kanban | List)
- Option selectors

---

## 14. Accordion

### 14.1 Accordion Item

**Visual Specs:**
- Header: Glass card, padding `16px`, cursor pointer
- Content: Padding `16px`, animate height
- Icon: Chevron down (rotate 180° when open)

**Component API:**
```tsx
interface AccordionProps {
  items: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
  allowMultiple?: boolean;
}

<Accordion items={faqItems} allowMultiple={false} />
```

---

## 15. Table/List

### 15.1 Table

**Visual Specs:**
- Header: Glass background, sticky
- Row: Glass background on hover
- Cell: Padding `12px 16px`
- Border: Bottom border `1px solid rgba(255, 255, 255, 0.08)`

**Component API:**
```tsx
interface TableProps {
  columns: { key: string; label: string; sortable?: boolean }[];
  data: Record<string, any>[];
  onRowClick?: (row: any) => void;
}
```

---

## 16. Empty State

### 16.1 Empty State Card

**Visual Specs:**
- Container: Glass card, centered content
- Icon: Large icon (80px), gray
- Title: H3, gray
- Description: Body text, gray
- CTA: Primary button

**Component API:**
```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

<EmptyState 
  icon={<DocumentIcon />}
  title="Belum ada CV"
  description="Buat CV pertama untuk memulai"
  action={{ label: "Buat CV", onClick: handleCreate }}
/>
```

---

## 17. Avatar

### 17.1 User Avatar

**Visual Specs:**
- Size: `32px` (sm), `40px` (md), `64px` (lg), `120px` (xl)
- Border radius: `9999px`
- Border: `2px solid rgba(255, 255, 255, 0.3)`
- Fallback: Initials on gradient background

**Component API:**
```tsx
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  badge?: React.ReactNode; // Premium badge overlay
}

<Avatar src={user.avatar} alt={user.name} size="md" badge={<PremiumBadge />} />
```

---

## Implementation Checklist

### Phase 1: Core Components
- [ ] GlassCard
- [ ] GlassNavbar
- [ ] Button (all variants)
- [ ] Input (text, textarea, select)
- [ ] Badge
- [ ] Modal

### Phase 2: Layout Components
- [ ] BentoGrid
- [ ] Tabs
- [ ] Accordion
- [ ] Table

### Phase 3: Specialized Components
- [ ] KanbanBoard + KanbanCard
- [ ] CVPreview
- [ ] CircularProgress
- [ ] ProgressBar
- [ ] Toast

### Phase 4: Utility Components
- [ ] Dropdown
- [ ] Avatar
- [ ] EmptyState
- [ ] Skeleton

---

## Testing Guidelines

1. **Visual Regression:** Screenshot tests for each component variant
2. **Accessibility:** ARIA labels, keyboard navigation, focus states
3. **Responsive:** Test on mobile (375px), tablet (768px), desktop (1280px)
4. **Performance:** Backdrop-filter performance on low-end devices
5. **Browser Support:** Chrome, Safari, Firefox, Edge

---

## References

- [Radix UI](https://www.radix-ui.com/) — Unstyled components for base structure
- [Framer Motion](https://www.framer.com/motion/) — Animation library
- [Tailwind CSS](https://tailwindcss.com/) — Utility classes
