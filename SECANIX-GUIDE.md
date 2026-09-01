# Cara Pakai Secanix — Security Scanner

> **Secanix** adalah CLI security scanner untuk app hasil vibe-coding (Next.js + Supabase/Firebase).

## 1. Prasyarat (sudah terinstall)

| Tool | Versi | Cara Install |
|------|-------|-------------|
| ✅ **Node.js** | — | `node --version` |
| ✅ **Gitleaks** | 8.30+ | `winget install Gitleaks.Gitleaks` |
| ✅ **Semgrep** | 1.175+ | `pip install semgrep` |

## 2. Cara Menjalankan

### Jalankan langsung (via npx):
```bash
npx -p secanix@latest secanix
```

### Jalankan dari folder project ini (`D:\cuti`):
```bash
cd D:\cuti
npx -p secanix@latest secanix
```

## 3. Jika Secanix masih error "gak ketemu di PATH"

Di Windows, `npx` kadang tidak membaca PATH user. Solusi:

**Solusi A — Jalankan di terminal baru:**
1. Buka **PowerShell baru** (jangan pakai terminal yang dipakai instalasi)
2. `cd D:\cuti`
3. `npx -p secanix@latest secanix`

**Solusi B — Scan langsung tanpa secanix:**

Gunakan engine-nya langsung:

#### Scan Secret Bocor (Gitleaks):
```bash
# Scan seluruh repo
gitleaks detect --verbose

# Scan dengan output JSON
gitleaks detect --report-path gitleaks-report.json
```

#### Scan Celah Keamanan (Semgrep):
```bash
# Scan dengan aturan default
semgrep scan --config auto

# Scan dengan output JSON
semgrep scan --config auto --json > semgrep-report.json
```

## 4. Output yang Dihasilkan

| Kolom/Label | Arti |
|-------------|------|
| **Severity** | HIGH / MEDIUM / LOW — tingkat keparahan |
| **File** | File yang bermasalah |
| **Line** | Baris kode yang terdeteksi |
| **Finding** | Deskripsi masalah keamanan |

## 5. Tips

- **Jalankan sebelum push** ke repository publik
- **Jalankan setelah install dependency baru** (npm install)
- Jika ada false positive, tambahkan path ke file `.gitleaksignore`:
  ```
  echo "path-ke-file.txt" >> .gitleaksignore
  ```