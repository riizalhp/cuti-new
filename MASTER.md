# MASTER Design System - PageHeader Standard

## 1. Design Tokens & Styling Baseline

### Colors
- **Surface**: `bg-white dark:bg-slate-900`
- **Border**: `border border-slate-200 dark:border-slate-800`
- **Primary Text**: `text-slate-900 dark:text-slate-100`
- **Muted Text**: `text-slate-500 dark:text-slate-400`
- **Accent Indigo**: `bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800`
- **Accent Emerald**: `bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800`
- **Accent Amber**: `bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800`

### Spacing & Radii
- **Header Padding**: `p-4 sm:p-5 md:p-6`
- **Border Radius**: `rounded-2xl`
- **Header Height**: Compact (`min-h-[80px]`), max-content height.

---

## 2. PageHeader Architecture

Every sub-page header MUST follow this standardized layout:

```tsx
<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
  {/* Left Side: Page Identity & Brief Context */}
  <div className="space-y-1">
    <div className="flex items-center gap-2.5">
      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
        <Icon className="w-5 h-5" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
        {title}
      </h1>
      {badge && (
        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {badge}
        </span>
      )}
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl pl-[42px]">
      {subtitle}
    </p>
  </div>

  {/* Right Side: Quick Live Stats / Actions */}
  {stats && (
    <div className="flex items-center gap-3 self-start md:self-auto flex-wrap pt-2 md:pt-0">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          {stat.icon && <stat.icon className="w-4 h-4 text-slate-400" />}
          <div>
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

---

## 3. Page Header Mappings

| Page | Icon | Title | Short Subtitle | Stats / Badges Right |
|---|---|---|---|---|
| `/cv` | `FileText` | Manajemen & Service CV | Kelola dan optimasi CV mandiri atau gunakan bantuan AI & Tim HR untuk kelolosan ATS. | `[Score ATS / Total CV]` |
| `/evaluasi-cv` | `FileCheck` | Evaluasi CV & Target | Simulasi penilaian CV berdasarkan kriteria spesifik recruiter, ATS, dan kualifikasi target. | `[Status Target / ATS Rating]` |
| `/linkedin` | `Search` | Auditor & Ekstraktor LinkedIn | Audit profil LinkedIn dan dapatkan rekomendasi optimasi skor SEO recruiter. | `[Status Profil / SEO Score]` |
| `/tracker` | `Target` | Tracker Lamaran Kerja | Pantau alur dan status seluruh lamaran kerja dari screening hingga offering letter. | `[Total / Sent / Interview / Offer]` |
| `/scrape-jobs` | `Globe` | Pemindai Lowongan Kerja | Informasi lowongan kerja aktif terfilter otomatis dengan skor kepantasan CV-mu. | `[24 Portal Connected / Live Jobs]` |
| `/kecocokan-lowongan` | `BarChart3` | Leaderboard & Perbandingan Lowongan | Bandingkan skor kepantasan CV dengan beberapa lowongan kerja sekaligus. | `[Total Job Compared]` |
| `/surat-lamaran` | `FileSpreadsheet` | Pembuat Surat Lamaran | Buat Cover Letter khusus yang disesuaikan dengan posisi target secara instan. | `[Cover Letter Generated]` |
| `/interview` | `Video` | Pusat Persiapan Interview | Latih jawaban interview dengan AI Evaluator dan pelajari bank soal HR & User. | `[Skor Kesiapan: 85/100]` |
| `/misi-cuan` | `Gift` | Misi & Reward Karier | Selesaikan aktivitas pencarian kerja untuk mengumpulkan Koin & XP reward. | `[Saldo Koin / Level Karier]` |
| `/affiliate` | `Users` | Undag Teman & Referral | Dapatkan reward koin dan akses premium dengan mengundang rekan pencari kerja. | `[Total Bonus / Referrals]` |
