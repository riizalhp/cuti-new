import * as XLSX from "xlsx"

export type CMSEntityKey = "articles" | "jobs" | "courses" | "certifications" | "events"

export interface EntityConfig {
  key: CMSEntityKey
  label: string
  sheetName: string
  filenamePrefix: string
  columns: { key: string; label: string; example: any; required?: boolean }[]
  samples: Record<string, any>[]
}

/**
 * Sanitasi string untuk mencegah Formula Injection (CWE-1236) pada Microsoft Excel / Google Sheets
 */
export function sanitizeCellValue(val: any): any {
  if (typeof val === "string") {
    const trimmed = val.trim()
    if (/^[=+@-]/i.test(trimmed)) {
      return `'${trimmed}`
    }
    return val
  }
  return val
}

export const ENTITY_CONFIGS: Record<CMSEntityKey, EntityConfig> = {
  articles: {
    key: "articles",
    label: "Artikel Karier",
    sheetName: "Artikel",
    filenamePrefix: "template-artikel-employr",
    columns: [
      { key: "title", label: "Judul", example: "Panduan Lolos Interview HRD untuk Fresh Graduate", required: true },
      { key: "author", label: "Penulis", example: "Admin Employr", required: true },
      { key: "category", label: "Kategori", example: "Tips Interview" },
      { key: "content", label: "Konten Artikel (Teks Biasa / Paragraf / Markdown)", example: "Persiapan wawancara kerja yang matang sangat menentukan kelulusanmu.\n\n### Poin Penting:\n- Pelajari profil perusahaan\n- Siapkan jawaban cerita STAR\n- Latihan gestur tubuh", required: true },
      { key: "tags", label: "Tag (Koma)", example: "interview, karir, tips" },
      { key: "coverImageUrl", label: "URL Gambar Sampul", example: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" },
      { key: "isPublished", label: "Status Terbit (TRUE/FALSE)", example: true },
    ],
    samples: [
      {
        title: "Panduan Sukses Lolos Interview Pertama untuk Fresh Graduate",
        author: "Admin Employr",
        category: "Tips Interview",
        content: "Menghadapi wawancara kerja pertama sering kali membuat gugup. Berikut adalah beberapa langkah penting yang perlu kamu persiapkan sebelum dan saat wawancara berlangsung.\n\n### Tips Utama\n- Riset mendalam tentang visi misi dan produk perusahaan\n- Gunakan metode STAR saat menjawab studi kasus\n- Ajukan 2-3 pertanyaan kritis di akhir sesi wawancara",
        tags: "interview, freshgraduate, karir, tips",
        coverImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        isPublished: true,
      },
      {
        title: "5 Kesalahan Fatal dalam Membuat CV yang Sering Dilakukan Pemula",
        author: "Rian Pratama",
        category: "Pembuatan CV",
        content: "Banyak pelamar kerja ditolak bukan karena tidak kompeten, melainkan karena format CV yang tidak ramah ATS atau terlalu berbelit-belit.\n\nPastikan CV kamu menggunakan struktur yang bersih, font standar seperti Inter atau Arial, serta mencantumkan pencapaian berbasis angka yang terukur.",
        tags: "cv, resume, ats, pemula",
        coverImageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
        isPublished: true,
      },
    ],
  },
  jobs: {
    key: "jobs",
    label: "Lowongan Kerja",
    sheetName: "LowonganKerja",
    filenamePrefix: "template-lowongan-employr",
    columns: [
      { key: "title", label: "Posisi Lowongan", example: "Junior Frontend Developer", required: true },
      { key: "company", label: "Nama Perusahaan", example: "PT Digital Nusantara Inovasi", required: true },
      { key: "location", label: "Lokasi Kerja", example: "Jakarta Selatan" },
      { key: "workType", label: "Tipe Kerja (ONSITE/REMOTE/HYBRID/ONLINE)", example: "HYBRID" },
      { key: "salaryMin", label: "Gaji Min (IDR)", example: 5000000 },
      { key: "salaryMax", label: "Gaji Max (IDR)", example: 8000000 },
      { key: "description", label: "Deskripsi Lowongan", example: "Membangun antarmuka web modern dengan Next.js dan Tailwind CSS." },
      { key: "externalUrl", label: "Link Pendaftaran", example: "https://karir.digitalnusantara.id/jobs/frontend", required: true },
      { key: "tags", label: "Tag Keahlian (Koma)", example: "React, Next.js, TypeScript" },
      { key: "isActive", label: "Status Aktif (TRUE/FALSE)", example: true },
    ],
    samples: [
      {
        title: "Junior Frontend Developer",
        company: "PT Digital Nusantara Inovasi",
        location: "Jakarta Selatan",
        workType: "HYBRID",
        salaryMin: 5000000,
        salaryMax: 8000000,
        description: "Membangun antarmuka web modern dengan Next.js, Tailwind CSS, dan integrasi API RESTful.",
        externalUrl: "https://karir.digitalnusantara.id/jobs/junior-frontend",
        tags: "React, Next.js, TypeScript, Tailwind",
        isActive: true,
      },
      {
        title: "Social Media Specialist",
        company: "Agensi Kreatif Muda",
        location: "Bandung",
        workType: "ONSITE",
        salaryMin: 4000000,
        salaryMax: 6000000,
        description: "Mengelola konten TikTok, Instagram, dan strategi engagement komunitas generasi Z.",
        externalUrl: "https://kreatifmuda.id/karir/social-media",
        tags: "Social Media, Content Creator, Copywriting",
        isActive: true,
      },
    ],
  },
  courses: {
    key: "courses",
    label: "Kursus & Skills",
    sheetName: "Kursus",
    filenamePrefix: "template-kursus-employr",
    columns: [
      { key: "title", label: "Judul Kursus", example: "Fundamental UI/UX Design untuk Pemula", required: true },
      { key: "instructor", label: "Instruktur / Lembaga", example: "KarierDesain Studio", required: true },
      { key: "level", label: "Tingkat (Pemula/Menengah/Mahir)", example: "Pemula" },
      { key: "price", label: "Biaya (0 = Gratis)", example: 0 },
      { key: "durationHours", label: "Durasi (Jam)", example: 10 },
      { key: "description", label: "Deskripsi Kursus", example: "Belajar wireframing, typography, color theory, dan Figma.", required: true },
      { key: "externalUrl", label: "Link Kursus", example: "https://loker.employr.id/kursus/fundamental-ui-ux", required: true },
      { key: "coverImageUrl", label: "URL Gambar Sampul", example: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80" },
      { key: "tags", label: "Tag Topik (Koma)", example: "UI/UX, Figma, Design" },
      { key: "isActive", label: "Status Aktif (TRUE/FALSE)", example: true },
    ],
    samples: [
      {
        title: "Fundamental UI/UX Design untuk Pemula",
        instructor: "KarierDesain Studio",
        level: "Pemula",
        price: 0,
        durationHours: 10,
        description: "Belajar wireframing, typography, color theory, dan praktek membuat prototipe aplikasi mobile di Figma.",
        externalUrl: "https://loker.employr.id/kursus/fundamental-ui-ux",
        coverImageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
        tags: "UI/UX, Figma, Design, Pemula",
        isActive: true,
      },
      {
        title: "Bootcamp SQL & Analisis Data Bisnis",
        instructor: "Data Academy Indonesia",
        level: "Menengah",
        price: 149000,
        durationHours: 24,
        description: "Kuasai query PostgreSQL, database indexing, dan pembuatan laporan dashboard bisnis.",
        externalUrl: "https://dataacademy.id/sql-bootcamp",
        coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        tags: "SQL, PostgreSQL, Data Analysis, Business",
        isActive: true,
      },
    ],
  },
  certifications: {
    key: "certifications",
    label: "Sertifikasi",
    sheetName: "Sertifikasi",
    filenamePrefix: "template-sertifikasi-employr",
    columns: [
      { key: "title", label: "Nama Sertifikasi", example: "BNSP Junior Web Programmer", required: true },
      { key: "provider", label: "Lembaga Penerbit", example: "LSP Informatika Indonesia (BNSP)", required: true },
      { key: "price", label: "Biaya Ujian (0 = Gratis)", example: 350000 },
      { key: "durationHours", label: "Estimasi Durasi (Jam)", example: 32 },
      { key: "description", label: "Deskripsi Kompetensi", example: "Sertifikasi resmi standar SKKNI untuk pemrograman web.", required: true },
      { key: "externalUrl", label: "Link Pendaftaran / Info", example: "https://lsp-informatika.id/sertifikasi/junior-web", required: true },
      { key: "coverImageUrl", label: "URL Logo / Badge", example: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" },
      { key: "tags", label: "Tag Bidang (Koma)", example: "BNSP, Programmer, Web" },
      { key: "isActive", label: "Status Aktif (TRUE/FALSE)", example: true },
    ],
    samples: [
      {
        title: "BNSP Junior Web Programmer",
        provider: "LSP Informatika Indonesia (BNSP)",
        price: 350000,
        durationHours: 32,
        description: "Sertifikasi resmi standar SKKNI untuk membuktikan kompetensi dasar pemrograman web di dunia industri kerja.",
        externalUrl: "https://lsp-informatika.id/sertifikasi/junior-web-programmer",
        coverImageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
        tags: "BNSP, Programmer, Web, Sertifikasi Resmi",
        isActive: true,
      },
      {
        title: "Google Digital Marketing & E-Commerce",
        provider: "Google Career Certificates",
        price: 0,
        durationHours: 40,
        description: "Pelajari search engine optimization (SEO), social media marketing, email campaign, dan analytics toko online.",
        externalUrl: "https://grow.google/certificates/digital-marketing-ecommerce",
        coverImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        tags: "Google, Marketing, SEO, E-Commerce",
        isActive: true,
      },
    ],
  },
  events: {
    key: "events",
    label: "Event Job Fair",
    sheetName: "EventJobFair",
    filenamePrefix: "template-event-employr",
    columns: [
      { key: "title", label: "Nama Event", example: "National Virtual Job Fair 2026", required: true },
      { key: "eventDate", label: "Tanggal (YYYY-MM-DD)", example: "2026-11-20", required: true },
      { key: "location", label: "Lokasi / Platform", example: "Online via Zoom", required: true },
      { key: "type", label: "Tipe (ONLINE/HYBRID/ONSITE)", example: "ONLINE" },
      { key: "description", label: "Deskripsi Event", example: "Bursa kerja virtual mempertemukan 50+ perusahaan.", required: true },
      { key: "externalUrl", label: "Link Pendaftaran / Tiket", example: "https://loker.employr.id/event/virtual-jobfair", required: true },
      { key: "coverImageUrl", label: "URL Banner Poster", example: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80" },
      { key: "tags", label: "Tag Event (Koma)", example: "Job Fair, Karir, Virtual" },
      { key: "isActive", label: "Status Aktif (TRUE/FALSE)", example: true },
    ],
    samples: [
      {
        title: "National Virtual Job Fair 2026",
        eventDate: "2026-11-20",
        location: "Online via Zoom & Employr Portal",
        type: "ONLINE",
        description: "Bursa kerja virtual terbesar mempertemukan 50+ perusahaan teknologi dan startup dengan talenta muda se-Indonesia.",
        externalUrl: "https://loker.employr.id/event/virtual-jobfair-2026",
        coverImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
        tags: "Job Fair, Karir, Virtual, Fresh Graduate",
        isActive: true,
      },
      {
        title: "Workshop Persiapan Karier BUMN & CPNS",
        eventDate: "2026-12-05",
        location: "Auditorium Perpustakaan Nasional, Jakarta",
        type: "ONSITE",
        description: "Bedah soal tes SKD, simulasi wawancara user, dan tips lolos seleksi BUMN batch terbaru bersama para alumni.",
        externalUrl: "https://loker.employr.id/event/workshop-bumn-cpns",
        coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        tags: "BUMN, CPNS, Workshop, Persiapan Kerja",
        isActive: true,
      },
    ],
  },
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Download sample template (XLSX, CSV, atau JSON)
 */
export function downloadTemplate(entityKey: CMSEntityKey, format: "xlsx" | "csv" | "json") {
  const cfg = ENTITY_CONFIGS[entityKey]
  const filename = `${cfg.filenamePrefix}.${format}`

  if (format === "json") {
    const jsonStr = JSON.stringify(cfg.samples, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" })
    triggerDownload(blob, filename)
    return
  }

  // Siapkan data tabular
  const rows = cfg.samples.map((item) => {
    const row: Record<string, any> = {}
    cfg.columns.forEach((col) => {
      let val = item[col.key] ?? ""
      row[col.key] = sanitizeCellValue(val)
    })
    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: cfg.columns.map((c) => c.key),
  })

  // Auto column widths
  const colWidths = cfg.columns.map((c) => ({
    wch: Math.max(c.key.length, String(c.example).length, 14),
  }))
  worksheet["!cols"] = colWidths

  if (format === "csv") {
    const csvContent = "\uFEFF" + XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    triggerDownload(blob, filename)
  } else {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, cfg.sheetName)
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    triggerDownload(blob, filename)
  }
}

/**
 * Export data yang ada di database ke XLSX, CSV, atau JSON
 */
export function exportData(entityKey: CMSEntityKey, data: any[], format: "xlsx" | "csv" | "json") {
  const cfg = ENTITY_CONFIGS[entityKey]
  const timestamp = new Date().toISOString().split("T")[0]
  const filename = `export-${cfg.key}-${timestamp}.${format}`

  if (format === "json") {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" })
    triggerDownload(blob, filename)
    return
  }

  const rows = (data.length > 0 ? data : cfg.samples).map((item) => {
    const row: Record<string, any> = {}
    cfg.columns.forEach((col) => {
      let val = item[col.key] ?? ""
      if (Array.isArray(val)) val = val.join(", ")
      row[col.key] = sanitizeCellValue(val)
    })
    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: cfg.columns.map((c) => c.key),
  })

  if (format === "csv") {
    const csvContent = "\uFEFF" + XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    triggerDownload(blob, filename)
  } else {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, cfg.sheetName)
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    triggerDownload(blob, filename)
  }
}

/**
 * Parser file client-side untuk .xlsx, .xls, .csv, dan .json
 */
export async function parseImportFile(file: File, entityKey: CMSEntityKey): Promise<{
  success: boolean
  items: any[]
  error?: string
  rawCount: number
}> {
  try {
    const ext = file.name.split(".").pop()?.toLowerCase()

    if (ext === "json") {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) {
        return { success: false, items: [], error: "File JSON harus berupa Array of Objects [ {...}, {...} ]", rawCount: 0 }
      }
      return { success: true, items: parsed, rawCount: parsed.length }
    }

    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) {
        return { success: false, items: [], error: "File tidak memiliki sheet data yang valid.", rawCount: 0 }
      }
      const sheet = workbook.Sheets[firstSheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" })

      if (rows.length === 0) {
        return { success: false, items: [], error: "File kosong atau tidak memiliki data baris.", rawCount: 0 }
      }

      // Normalisasi header (case-insensitive & whitespace trimmed)
      const cfg = ENTITY_CONFIGS[entityKey]
      const normalizedItems = rows.map((rawRow) => {
        const item: Record<string, any> = {}
        const rawKeys = Object.keys(rawRow)

        cfg.columns.forEach((col) => {
          const matchKey = rawKeys.find(
            (k) =>
              k.trim().toLowerCase() === col.key.toLowerCase() ||
              k.trim().toLowerCase() === col.label.toLowerCase()
          )
          if (matchKey !== undefined) {
            let val = rawRow[matchKey]
            // Bersihkan string tanda petik pencegah injection
            if (typeof val === "string" && val.startsWith("'")) {
              val = val.substring(1)
            }
            item[col.key] = val
          }
        })
        return item
      })

      return { success: true, items: normalizedItems, rawCount: normalizedItems.length }
    }

    return { success: false, items: [], error: "Format file tidak didukung. Harap unggah file .xlsx, .csv, atau .json.", rawCount: 0 }
  } catch (err: any) {
    return { success: false, items: [], error: err.message || "Gagal membaca berkas.", rawCount: 0 }
  }
}
