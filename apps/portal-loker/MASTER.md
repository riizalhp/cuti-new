# MASTER.md — PortalKerja Design System

Single source of truth untuk portal-loker visual identity.

---

## 1. Visual Thesis

"Modern editorial portal layout with landing page palette (ink `#101114`, paper `#f5f6f2`, cobalt `#1738d1`, periwinkle `#c9d0ff`, lime `#c8f55b`), Inter Tight + Bodoni Moda typography, clean rounded-xl (10px) components with subtle borders, and seamlessly blended Google Ads slots designed as native card components."

## 2. Interaction Thesis

"Calm, high-readability interaction language with fast functional transitions (150-200ms), subtle border/fill state shifts on hover (no layout jitter or high translateY), static non-distracting ad slots, and zero disruptive scroll animations to maximize content focus and ad CTR."

---

## 3. Design Tokens

### Color Palette (Landing Page Matched)
| Token Name | Hex Code | Usage |
|---|---|---|
| `--ink` | `#101114` | Primary text, dark buttons, dark badges |
| `--paper` | `#f5f6f2` | Main page background, card fill |
| `--surface` | `#ffffff` | Elevated card background |
| `--cobalt` | `#1738d1` | Primary brand accent, primary CTA, links |
| `--periwinkle` | `#c9d0ff` | Subtle highlight, tag backgrounds, chip fill |
| `--lime` | `#c8f55b` | Selection background, "Baru" badge, key accent |
| `--muted` | `#6b7280` | Secondary text, captions, inactive nav |
| `--border` | `#e5e7eb` | Subtle card borders |
| `--border-strong` | `#101114` | High-contrast borders (1px solid var(--ink)) |
| `--hatch` | `repeating-linear-gradient(...)` | Ad slot background placeholder |

### Typography
- **Primary / Body**: `'Inter Tight', sans-serif` (400, 500, 600, 700)
- **Brand / Editorial**: `'Bodoni Moda', serif` (700, Italic)
- **Accent / Sub-editorial**: `'Instrument Serif', serif` (400)

| Level | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| `h1` | 36px | 700 | 1.15 | -0.02em |
| `h2` | 24px | 700 | 1.2 | -0.01em |
| `h3` | 17-18px | 600 | 1.25 | -0.01em |
| `body` | 15px | 400 | 1.55 | 0 |
| `small` | 13px | 500 | 1.4 | 0.01em |
| `tiny` | 11px | 600 | 1.3 | 0.02em |
| `caps` | 11px | 700 | 1.0 | 0.1em (UPPERCASE) |

### Border Radius (10px Rounded Clean)
- `var(--r)`: `10px` (`rounded-xl` / `0.625rem`)
- `var(--r-sm)`: `6px` (`rounded-md`)
- `var(--r-full)`: `9999px` (chips & rounded pills)

### Elevation & Borders
- **Default border**: `1px solid var(--border)` (`#e5e7eb`)
- **Card hover border**: `1px solid var(--cobalt)`
- **Shadow**: `0 2px 8px -2px rgba(16,17,20,0.06)`

---

## 4. Google Ads Integration Strategy

Slot iklan dirancang menyatu dengan ritme visual portal agar pembaca tidak mengalami *ad blindness*, sekaligus menjaga CTR tinggi tanpa memicu *accidental clicks*:

1. **Native In-Feed (In-feed Ads)**:
   - Dibuat menggunakan struktur `.card` (border `#e5e7eb`, `rounded-xl`, padding `18px`).
   - Penanda iklan menggunakan badge subtle `Iklan · Google Ads` di sudut kanan atas.
   - Ukuran: min-height `120px` selip di antara seksi konten.

2. **Sidebar Slots (MREC 300×250 & Skyscraper 300×600)**:
   - Lebar persis `300px` sesuai standar IAB.
   - Ditempatkan di dalam `.sidebar` yang menggunakan `position: sticky; top: 80px;` untuk memaksimalkan viewability saat pengguna scroll.

3. **Leaderboard Top Slot (728×90)**:
   - Ditempatkan langsung di bawah Hero section, rata tengah max-width `728px`.
