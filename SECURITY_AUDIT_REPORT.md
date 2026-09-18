# LAPORAN KOMPREHENSIF SECURITY AUDIT & PENETRATION TESTING
**Target:** CUTI Monorepo Platform (`D:/cuti`)  
**Tanggal Audit:** 14 September 2026  
**Auditor:** Hermes Agent Security Review  
**Klasifikasi:** Confidential / Internal Only  

---

## 1. Executive Summary & Ringkasan Lingkup

Audit keamanan dilakukan secara menyeluruh terhadap seluruh arsitektur monorepo platform CUTI yang terdiri dari 4 aplikasi utama dan package penunjang:

| Port | Komponen / Aplikasi | Framework / Teknologi | Fungsi Utama | Status Keamanan |
| :--- | :--- | :--- | :--- | :--- |
| **3000** | `apps/dashboard` | Next.js (App Router) | Dashboard User / Job Seeker | 🟡 Sedang (Beberapa celah auth/CORS) |
| **3001** | `apps/api` | NestJS + Prisma | Core Backend REST API | 🔴 **KRITIS (Auth Bypass Total)** |
| **3002** | `apps/admin` | Next.js (App Router) | Admin CMS & Platform Management | 🔴 **KRITIS (Unauth Upload & Brute-force)** |
| **3003** | `apps/portal-loker` | Astro SSR/SSG | Public Job Board & Portal Artikel | 🟢 Aman (Read-only Data Layer) |
| - | `apps/web` | Astro | Landing Page / Marketing | 🟢 Aman (Static / Read-only) |
| - | `packages/db` | Prisma ORM | Data Layer & Security Logger | 🟡 Butuh Perbaikan Logic Lockout |

### Ringkasan Temuan Vulnerability
* 🔴 **Critical Severity:** 2 Temuan
* 🟠 **High Severity:** 2 Temuan
* 🟡 **Medium Severity:** 3 Temuan
* 🟢 **Low / Informational:** 3 Temuan

---

## 2. Temuan Mendalam per Komponen (Deep-Dive Analysis)

---

### A. PORT 3001: Core API Backend (`apps/api`) — NestJS

#### 🔴 [CRITICAL-01] Pemalsuan Token Autentikasi (Authentication Bypass via Unsigned Tokens)
* **File Terdampak:**  
  - `apps/api/src/auth/auth.service.ts` (baris 131–137)
  - `apps/api/src/auth/guards/auth.guard.ts` (baris 18–38)
* **CVSS Score:** **10.0 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H)**
* **Deskripsi:**  
  Token akses (`accessToken` & `refreshToken`) di-generate hanya menggunakan encoding `Base64` tanpa tanda tangan kriptografi (HMAC/RSA signature):
  ```typescript
  // auth.service.ts
  private generateTokens(userId: string) {
    const accessToken = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 900000 })).toString('base64');
    const refreshToken = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 604800000 })).toString('base64');
    return { accessToken, refreshToken };
  }
  ```
  Pada `auth.guard.ts`, validasi token hanya melakukan `JSON.parse(Buffer.from(token, 'base64').toString())` dan langsung mempercayai `userId` tanpa verifikasi rahasia.
* **Skenario Eksploitasi (PoC):**
  Attacker dapat memalsukan token untuk `userId` siapapun (termasuk admin atau user lain) cukup dengan base64 encoding:
  ```bash
  FORGED_TOKEN=$(echo -n '{"userId":"<target-user-id>","exp":9999999999999}' | base64)
  curl -H "Authorization: Bearer $FORGED_TOKEN" http://localhost:3001/v1/cv
  ```
* **Dampak:** Pengambilalihan akun secara menyeluruh (Full Account Takeover), akses data CV, profil pengguna, dan seluruh entitas privat tanpa password.
* **Rekomendasi Perbaikan:**  
  Gunakan library standar `jsonwebtoken` atau `@nestjs/jwt` dengan secret key (`JWT_SECRET`) dari environment variable.

---

#### 🟠 [HIGH-01] Kebijakan CORS Terlalu Terbuka (Permissive CORS Origin)
* **File Terdampak:** `apps/api/src/main.ts` (baris 7–17)
* **CVSS Score:** **7.5 (High)**
* **Deskripsi:**  
  Konfigurasi CORS mengizinkan semua domain di luar whitelist saat fallback:
  ```typescript
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || /^(http:\/\/(localhost|127\.0\.0\.1|...)(:\d+)?$)/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
  });
  ```
* **Dampak:** Situs web jahat dapat melakukan request Cross-Origin ke API dengan `credentials: true`.
* **Rekomendasi Perbaikan:**  
  Tolak origin yang tidak dikenal secara eksplisit di environment produksi: `callback(new Error('Not allowed by CORS'))`.

---

#### 🟠 [HIGH-02] Tidak Ada Rate Limiting pada Endpoint Auth (`/v1/auth/*`)
* **File Terdampak:** `apps/api/src/auth/auth.controller.ts`
* **CVSS Score:** **7.3 (High)**
* **Deskripsi:** Endpoint `/v1/auth/login` dan `/v1/auth/register` tidak memiliki proteksi rate limiting bawaan (ThrottlerGuard).
* **Dampak:** Rawan serangan brute-force credential stuffing dan resource exhaustion (DDoS) karena proses hashing password menggunakan bcrypt/scrypt yang memakan resource CPU.
* **Rekomendasi Perbaikan:**  
  Pasang `@nestjs/throttler` dengan batas maksimal 5–10 request per menit untuk endpoint auth.

---

### B. PORT 3002: Admin Panel (`apps/admin`) — Next.js

#### 🔴 [CRITICAL-02] Endpoint File Upload Tanpa Autentikasi (Unauthenticated File Upload)
* **File Terdampak:** `apps/admin/src/app/api/cms/upload/route.ts` (baris 8–88)
* **CVSS Score:** **8.6 (High)**
* **Deskripsi:**  
  Endpoint `POST /api/cms/upload` dapat diakses oleh publik tanpa adanya verifikasi cookie session admin (`cuti_admin_session`). File yang diunggah otomatis disebarkan ke 4 folder publik:
  - `apps/admin/public/uploads/articles`
  - `apps/dashboard/public/uploads/articles`
  - `apps/portal-loker/public/uploads/articles`
  - `apps/web/public/uploads/articles`
* **Dampak:**  
  1. Siapapun dapat mengunggah file hingga 10MB tanpa login.
  2. Potensi disk exhaustion attack (memenuhi kapasitas storage server).
  3. Potensi Stored XSS / Defacement melalui file format `.svg` atau `.html` yang disajikan dari root web server.
* **Rekomendasi Perbaikan:**  
  Validasi session token admin sebelum memproses `req.formData()`.

---

#### 🟡 [MEDIUM-01] Fitur Brute Force Detection Tidak Melakukan Pemblokiran (Audit-Only Brute Force)
* **File Terdampak:**  
  - `apps/admin/src/app/api/auth/login/route.ts` (baris 70)
  - `packages/db/src/logger.ts` (baris `detectBruteForce`)
* **CVSS Score:** **6.5 (Medium)**
* **Deskripsi:**  
  Fungsi `detectBruteForce()` mengembalikan nilai `boolean` (`true` jika melebihi threshold 5 percobaan dalam 15 menit), namun pemanggil di route login tidak mengecek return value tersebut:
  ```typescript
  if (ctx.ip) await detectBruteForce(ctx.ip, cleanEmail); // Return value diabaikan!
  return NextResponse.json({ success: false, message: "Kata sandi salah." }, { status: 401 });
  ```
* **Dampak:** Penyerang dapat melakukan brute-force password admin tanpa pernah diblokir atau di-rate limit oleh server.
* **Rekomendasi Perbaikan:**  
  Cek hasil `detectBruteForce` sebelum mengecek database atau tolak langsung dengan status `429 Too Many Requests`.

---

#### 🟡 [MEDIUM-02] Kebocoran Informasi Pesan Error Sistem (Error Stack & Message Leakage)
* **File Terdampak:** `apps/admin/src/app/api/auth/login/route.ts` (baris 108–120)
* **CVSS Score:** **5.3 (Medium)**
* **Deskripsi:**  
  Blok `catch` mengembalikan `error.message` dan `error.code` mentah dari database Prisma atau runtime Node.js ke response JSON client.
* **Dampak:** Membocorkan struktur query database, path direktori server, dan detail driver internal.
* **Rekomendasi Perbaikan:**  
  Log pesan error secara internal di server, kembalikan pesan generik (`"Terjadi kesalahan pada sistem"`) ke client.

---

### C. PORT 3000: User Dashboard (`apps/dashboard`) — Next.js

#### 🟡 [MEDIUM-03] Wildcard CORS pada Endpoint Autentikasi
* **File Terdampak:** `apps/dashboard/app/api/auth/login/route.ts` (baris 6–14)
* **CVSS Score:** **5.8 (Medium)**
* **Deskripsi:**  
  Header `'Access-Control-Allow-Origin': '*'` diaktifkan pada endpoint login dashboard. Meskipun session disimpan di database dan dikembalikan via JSON/Cookie, CORS wildcard pada endpoint sensitif melanggar prinsip least privilege.
* **Rekomendasi Perbaikan:**  
  Batasi `Access-Control-Allow-Origin` hanya ke domain frontend resmi (`process.env.APP_URL`).

#### 🟢 [INFO-01] Validasi Rate Limit Lokal Dashboard
* **Catatan Positif:**  
  Berbeda dari Admin, `apps/dashboard` sudah mengimplementasikan `checkRateLimit` in-memory (10 attempts / min per IP) pada login route.
* **Catatan Arsitektural:**  
  Karena in-memory, rate-limit akan reset jika server restart atau jika aplikasi dijalankan secara multi-instance (cluster). Di masa depan disarankan menggunakan Redis.

---

### D. PORT 3003: Portal Loker (`apps/portal-loker`) & Web (`apps/web`) — Astro

#### 🟢 [LOW-01] Arsitektur Read-Only & Client Storage
* **Analisis:**  
  - Portal loker dan landing page dibangun dengan framework Astro.
  - Mayoritas halaman bersifat Server-Side Rendered (SSR) atau Static Site Generation (SSG).
  - Data diakses langsung via Prisma client (`@employr/db`) secara read-only tanpa mengekspos endpoint API mutasi publik.
  - Tidak ditemukan celah SQL Injection karena seluruh query menggunakan Prisma ORM parameterized queries.
  - Penggunaan `localStorage` hanya sebatas identifier visitor analytics anonim.

---

## 3. Matriks Rekomendasi & Rencana Remediasi (Action Plan)

| No | Komponen | Tindakan Remediasi | Estimasi Kerja | Prioritas |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `apps/api` | Ganti unsigned Base64 token dengan implementasi standar JWT (`jsonwebtoken`) | 15–20 menit | 🔴 **SEGERA (P0)** |
| **2** | `apps/admin` | Tambahkan validasi session admin pada `POST /api/cms/upload` | 5 menit | 🔴 **SEGERA (P0)** |
| **3** | `apps/admin` | Tambahkan block condition `if (isBruteForce) return 429` pada login | 5 menit | 🟠 **TINGGI (P1)** |
| **4** | `apps/api` | Kunci CORS whitelist hanya untuk domain spesifik (bukan permissive fallback) | 5 menit | 🟠 **TINGGI (P1)** |
| **5** | `apps/api` | Tambahkan Throttler / Rate Limit pada login & register | 15 menit | 🟠 **TINGGI (P1)** |
| **6** | `apps/admin` | Sanitize error output di response 500 | 5 menit | 🟡 **SEDANG (P2)** |
| **7** | `apps/dashboard` | Perketat CORS header pada endpoint auth | 5 menit | 🟡 **SEDANG (P2)** |

---

## 4. Kesimpulan Auditor

Platform CUTI memiliki fondasi keamanan yang baik pada layer database (menggunakan Prisma ORM parameterized queries, hashing scrypt/bcrypt, dan pemisahan role). Namun, terdapat **2 celah kritis** pada token generation API (port 3001) dan upload endpoint admin (port 3002) yang harus segera ditambal sebelum aplikasi diluncurkan ke production.

Laporan ini disimpan pada berkas lokal: `D:/cuti/SECURITY_AUDIT_REPORT.md`.
