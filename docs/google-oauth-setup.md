# Panduan Integrasi Google OAuth 2.0 — Employr

Dokumen ini menjelaskan konfigurasi otentikasi Google OAuth 2.0 untuk aplikasi Employr, membedakan antara lingkungan **Development (Lokal)** dan **Production (`employr.id`)**, serta cara kerja sinkronisasi database.

---

## 1. Arsitektur Domain & Redirect URI

| Lingkungan | Base URL Dashboard | Authorized JavaScript Origins | Authorized Redirect URI |
|---|---|---|---|
| **Development** | `http://localhost:3000` | `http://localhost:3000` | `http://localhost:3000/api/auth/callback/google` |
| **Production** | `https://app.employr.id` | `https://app.employr.id`, `https://employr.id` | `https://app.employr.id/api/auth/callback/google` |

> **Catatan Subdomain Resmi Employr:**
> - Landing Page: `https://employr.id`
> - Dashboard Pengguna: `https://app.employr.id`
> - Portal Lowongan: `https://loker.employr.id`
> - Kursus & Sertifikasi: `https://learning.employr.id`
> - FAQ & Panduan: `https://faq.employr.id`
> - Admin Panel: `https://admin-employr-rahasia.employr.id`

---

## 2. Langkah Setup di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan buat project baru (misal: `employr-auth`).
2. Masuk ke **APIs & Services** > **OAuth consent screen**:
   - Pilih tipe user: **External** lalu klik **Create**.
   - Masukkan informasi aplikasi:
     - **App name**: `Employr`
     - **User support email**: Email admin/pengembang
     - **Developer contact information**: Email pengembang
   - Pada bagian **Scopes**, klik **Add or Remove Scopes** dan centang:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Pada bagian **Test users**:
     - Jika status masih *Testing*, tambahkan akun Google pribadi atau tester yang ingin mencoba login.
     - Jika sudah siap publik, klik *Publish App*.
3. Masuk ke **Credentials** > **Create Credentials** > **OAuth Client ID**:
   - Application type: **Web application**
   - Name: `Employr Web Auth`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://app.employr.id`
     - `https://employr.id`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://app.employr.id/api/auth/callback/google`
4. Klik **Create** dan salin **Client ID** serta **Client Secret**.

---

## 3. Konfigurasi Environment Variables

Simpan kredensial pada file environment masing-masing lingkungan:

### A. Development (`apps/dashboard/.env.local`):
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="xxxxxx-dev.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxx"
```

### B. Production (Environment VPS / Cloudflare Pages / Server):
```env
NEXT_PUBLIC_APP_URL="https://app.employr.id"
GOOGLE_CLIENT_ID="xxxxxx-prod.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-yyyyyy"
```

---

## 4. Alur Kerja Kode (Endpoints)

Sistem otentikasi Google ditangani secara native melalui Next.js App Router API Routes di dashboard:

1. **Inisiasi Login**: `GET /api/auth/google?redirect=/beranda`
   - Berkas: [apps/dashboard/app/api/auth/google/route.ts](file:///D:/cuti/apps/dashboard/app/api/auth/google/route.ts)
   - Membuat token acak `state` anti-CSRF dan menyimpan parameter tujuan redirect.
   - Menyimpan `oauth_state` di cookie HttpOnly.
   - Mengalihkan browser ke halaman persetujuan login Google (`accounts.google.com`).

2. **Callback Persetujuan**: `GET /api/auth/callback/google`
   - Berkas: [apps/dashboard/app/api/auth/callback/google/route.ts](file:///D:/cuti/apps/dashboard/app/api/auth/callback/google/route.ts)
   - Memvalidasi parameter `state` dari Google terhadap cookie `oauth_state`.
   - Menukarkan `code` menjadi access token Google melalui `https://oauth2.googleapis.com/token`.
   - Mengambil data profil (nama, email, foto avatar) dari `https://www.googleapis.com/oauth2/v2/userinfo`.
   - **Sinkronisasi Database Prisma**:
     - Mencari user berdasarkan email. Jika belum terdaftar, otomatis membuat record `User` baru, akun provider di `accounts`, serta membership paket `FREE`.
     - Jika sudah terdaftar, menghubungkan akun provider Google jika belum terhubung.
   - Membuat token sesi aman di tabel `sessions`.
   - Memasang cookie sesi browser (`employr_auth_session` & `employr_user_session`).
   - Mengarahkan user ke `/onboarding` (jika user baru) atau tujuan redirect (misal `/beranda`).
