---
name: linkedin-career-intelligence-analyzer
description: Protokol analisis untuk mendiagnosis profil LinkedIn kandidat terhadap target karier menggunakan bukti yang bisa dipertanggungjawabkan, lalu menghasilkan rekomendasi terprioritas. Digunakan sebagai analyzer engine di balik fitur Career Intelligence / Optimasi LinkedIn Employr.
version: 2.0.0
author: Employr
license: Internal
metadata:
  employr:
    tags: [linkedin, career-intelligence, evidence-based-analysis, ai-analyzer]
    supersedes: linkedin-profile-optimization@1.0.0
    related_skills: [job-description-parsing, evidence-integrity]
---

# LinkedIn Career Intelligence Analyzer

## 1. Purpose

Skill ini BUKAN panduan "cara menulis LinkedIn yang bagus". Skill ini adalah protokol yang memaksa AI melakukan **diagnosis konsisten dan bisa diaudit** terhadap profil LinkedIn kandidat, dibandingkan dengan target peran tertentu, menggunakan hanya bukti yang tersedia di input — lalu menghasilkan rekomendasi yang terprioritas dan bisa dieksekusi manual oleh user (karena sistem tidak melakukan auto-apply ke LinkedIn).

Setiap output dari skill ini harus bisa dijawab: *"dari mana klaim ini berasal?"*

## 2. Scope

**Skill ini menangani:**
- Diagnosis kelengkapan dan kekuatan profil LinkedIn
- Perbandingan profil terhadap target role / job description
- Deteksi gap kompetensi dan kata kunci
- Prioritisasi rekomendasi berdasarkan impact vs effort
- Draft rewrite (headline, About, bullet pengalaman) sebagai *saran*, bukan sebagai fakta baru tentang kandidat

**Skill ini TIDAK menangani:**
- Auto-publish atau auto-edit ke LinkedIn (di luar kapabilitas sistem)
- Membangun CV/resume penuh (skill terpisah)
- Strategi engagement/konten LinkedIn jangka panjang
- Evaluasi profil level eksekutif/C-level (perlu skill terpisah dengan bobot berbeda)

## 3. When to Use

Gunakan skill ini ketika:
- Menganalisis profil LinkedIn (via URL/scrape terstruktur atau screenshot) terhadap satu target role
- User meminta skor kesiapan profil, gap analysis, atau rekomendasi perbaikan
- Input bisa berupa data terstruktur (JSON hasil ekstraksi) ATAU data parsial (screenshot yang hanya menampilkan sebagian section)

Jangan gunakan skill ini untuk menulis ulang seluruh profil dari nol tanpa data profil yang ada — itu authoring task biasa, bukan analysis task.

## 4. Input Contract

Analyzer HARUS mendeklarasikan input yang tersedia sebelum analisis dimulai. Field yang tidak ada di input harus ditandai `not_provided`, bukan diasumsikan kosong/tidak ada di LinkedIn asli.

```yaml
INPUT:
  profile:
    name: string | not_provided
    headline: string | not_provided
    about: string | not_provided
    location: string | not_provided
    current_role: string | not_provided
    education: string | not_provided
    experience: array | not_provided
    skills: array | not_provided
    certifications: array | not_provided
    projects: array | not_provided
    recommendations_section: array | not_provided
  source_type: "structured_extraction" | "screenshot_partial" | "manual_input"
  visible_sections: array   # section apa saja yang benar-benar terlihat/tersedia di source
  target_role: string
  target_industry: string | optional
  target_job_descriptions: array | optional   # 0-3 JD
```

**Aturan wajib:** jika `source_type = screenshot_partial`, analyzer harus membatasi temuan HANYA pada `visible_sections`. Section yang tidak terlihat masuk kategori `insufficient_data`, bukan `missing` atau `weak`.

## 5. Core Principles

### 5.1 Evidence First
Setiap temuan (finding) harus merujuk ke bagian input yang jadi dasarnya. Tidak ada temuan tanpa sumber.

### 5.2 No Hallucination
Lihat Section 15 (Evidence Integrity Rules) — bersifat non-negotiable, bukan saran.

### 5.3 Observation ≠ Inference ≠ Recommendation
Setiap temuan harus dipecah ke tiga layer secara eksplisit:

- **Observation** — apa yang benar-benar tertulis/terlihat di input, tanpa interpretasi.
- **Interpretation** — apa arti dari observation itu, secara eksplisit ditandai sebagai pembacaan AI, bukan fakta.
- **Recommendation** — tindakan konkret yang disarankan berdasarkan interpretation.

### 5.4 Recommendation Must Be Actionable
Rekomendasi tanpa contoh konkret ("perbaiki About section") tidak valid. Setiap rekomendasi harus menyertakan draft before/after atau langkah eksekusi yang jelas — karena user melakukan penerapan **manual**, effort mereka harus diminimalkan sebisa mungkin oleh AI.

## 6. Analysis Framework

Sepuluh dimensi diagnosis:
1. **Profile Completeness**
2. **Target Role Clarity**
3. **Recruiter Scan (30 detik)**: Evaluasi 10 aspek dengan status `critical | needs_attention | strong`
4. **Keyword Alignment**: Matched vs Missing vs Questionable
5. **Experience Evidence**: Aksi + tools + output vs daftar tugas
6. **Skills Relevance**: Konsistensi dengan target role
7. **Achievement Quality**: Kuantifikasi nyata tanpa mengarang angka
8. **Career Narrative**: Benang merah pendidikan → pengalaman → target role
9. **Profile Consistency**: Konsistensi antar seksi
10. **Risk Signals**: Klaim berlebihan atau gelar tanpa dasar

## 7. Job Description Alignment (Core Engine)

Tabel competency mapping:

| Competency | Profile Evidence | Status | Confidence |
|---|---|---|---|
| Content Strategy | Partial — disebut di project, tidak di skill | ⚠️ Partial | High |
| Social Media Management | Ya — di Experience & Skills | ✅ Found | High |
| Meta Ads | Tidak ditemukan di seluruh input | ❌ Not Found | High |

## 8. Gap Detection
- **Keyword gap** — kata kunci JD tidak muncul di profil sama sekali.
- **Evidence gap** — kandidat mengklaim skill tapi tidak ada bukti pendukung (project/experience) di input.
- **Narrative gap** — ada disconnect antara target role dan riwayat pendidikan/pengalaman.

## 9. Recommendation Prioritization
Format per rekomendasi (High Impact/Low Effort dulu):
- Priority [nomor] — [Impact] Impact / [Effort] Effort
- Problem: observation + interpretation singkat
- Why it matters
- Action: Before & After draft
- Evidence used
- Confidence: high | medium | low

## 10. Rewrite Rules
1. Gunakan hanya informasi dari input profil.
2. Maksimal 3 opsi untuk headline (1 rekomendasi utama).
3. Batas karakter headline maksimal 220 karakter.

## 11. Confidence Rules
- `high`: berdasarkan data tertulis eksplisit.
- `medium`: berdasarkan inferensi wajar atau proxy umum (misal tanpa JD spesifik).
- `low`: data parsial / terbatas.

## 12. Scoring Model
```
overall_score: 0-100 (Recruiter Scan 30%, Headline 20%, About 20%, Keywords 20%, Consistency 10%)
Status kualitatif: Strong | Needs Attention | Critical
```

## 13. Evidence Integrity Rules (Non-Negotiable)
1. Never invent achievements, metrics, employers, or certifications.
2. Never infer employment history from skills alone.
3. Never convert a responsibility into an achievement without explicit evidence of outcome.
4. Never invent metrics.
5. Never claim a section is "missing" if input hanya tidak menampilkan section itu.
6. Never recommend adding a skill solely because it appears in a job description.
7. Setiap finding wajib mengikuti struktur observation → interpretation → recommendation.
8. Setiap temuan faktual harus merujuk ke sumber evidence-nya secara eksplisit.
