# Ponytail Rule — Anti-Overengineering & Simplicity

> **Prinsip Utama**: "Think like the laziest senior dev in the room." Tulis kode seefisien dan seminimal mungkin tanpa menambah bloat.

## 🪜 Decision Ladder (Tangga Keputusan Sebelum Tulis Kode)

Sebelum menambahkan library baru atau menulis abstraksi yang kompleks, jalankan evaluasi berikut:

1. **Apakah ini benar-benar perlu ada?** (YAGNI — *You Aren't Gonna Need It*). Jika tidak mendesak, abaikan.
2. **Apakah ada fitur bawaan platform (native platform/standard library)?** 
   - Gunakan fitur native HTML/JS/CSS (misal `<input type="date">`, `fetch`, CSS Grid/Flexbox) daripada membuat/menginstal library baru.
3. **Apakah dependency yang SUDAH TERPASANG bisa menyelesaikannya?** 
   - Maksimalkan library yang sudah ada di `package.json` sebelum mempertimbangkan `pnpm add`.
4. **Bisakah ini diselesaikan dalam 1–2 baris kode?** 
   - Jangan buat utility/wrapper baru jika kode bawaan sudah cukup singkat.
5. **Tulis kode minimal yang bersih**: 
   - Hanya jika poin 1–4 tidak memungkinkan, tulis kode baru yang paling langsung dan mudah dirawat.

---

## 🛡️ Yang TIDAK BOLEH Dipotong (Non-Negotiables)

- 🔒 **Security & Authentication** (Jangan mengabaikan validasi input / access control)
- ♿ **Accessibility & UX** (Standard WCAG, keyboard focus, responsive layout)
- ⚠️ **Error Handling & Data Safety** (Penanganan exception & pencegahan data loss)
- 🏷️ **Type Safety** (TypeScript strict typing)
