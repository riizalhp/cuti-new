import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@employr/db"
import crypto from "crypto"

function slugify(text: string, maxLen = 100): string {
  const raw = text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (!raw) return "item"
  if (raw.length <= maxLen) return raw
  const cut = raw.slice(0, maxLen)
  const lastDash = cut.lastIndexOf("-")
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, "")
}

async function resolveUniqueSlug(
  baseText: string,
  checkExists: (slug: string) => Promise<boolean>,
  fallbackContext?: string
): Promise<string> {
  const baseSlug = slugify(baseText)
  if (!(await checkExists(baseSlug))) return baseSlug
  if (fallbackContext) {
    const contextSlug = slugify(`${baseText}-${fallbackContext}`, 110)
    if (contextSlug !== baseSlug && !(await checkExists(contextSlug))) {
      return contextSlug
    }
  }
  let counter = 2
  while (await checkExists(`${baseSlug}-${counter}`)) {
    counter++
  }
  return `${baseSlug}-${counter}`
}

function parseTags(val: any): string[] {
  if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean)
  if (typeof val === "string") {
    return val
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

function parseBool(val: any, defaultVal = true): boolean {
  if (val === undefined || val === null || val === "") return defaultVal
  if (typeof val === "boolean") return val
  const s = String(val).trim().toLowerCase()
  return s === "true" || s === "1" || s === "ya" || s === "aktif" || s === "terbit"
}

function formatInlineMarkdown(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

export function formatArticleContent(raw: string): string {
  if (!raw) return ""
  let text = String(raw).trim()

  const hasHtml = /<\/?(p|h[1-6]|ul|ol|li|blockquote|table|div)[^>]*>/i.test(text)

  if (hasHtml) {
    // Normalisasi & rapikan HTML: hapus tag kosong dan buat struktur bertingkat rapi
    return text
      .replace(/<p>\s*<\/p>/gi, "")
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "</p>\n<p>")
      .replace(/<\/p>\s*/gi, "</p>\n\n")
      .replace(/<h([1-6])[^>]*>/gi, "\n\n<h$1>")
      .replace(/<\/h([1-6])>\s*/gi, "</h$1>\n\n")
      .replace(/<ul[^>]*>/gi, "\n<ul>\n")
      .replace(/<\/ul>\s*/gi, "\n</ul>\n\n")
      .replace(/<ol[^>]*>/gi, "\n<ol>\n")
      .replace(/<\/ol>\s*/gi, "\n</ol>\n\n")
      .replace(/\s*<li>/gi, "\n  <li>")
      .replace(/<\/li>\s*/gi, "</li>")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }

  // Jika berupa plain text atau markdown: ubah otomatis menjadi HTML semantik
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)

  const htmlBlocks = blocks.map((block) => {
    // Heading: ## Judul atau ### Judul
    if (/^#{1,3}\s+(.+)$/m.test(block)) {
      return block.replace(/^#{1,3}\s+(.+)$/gm, "<h3>$1</h3>")
    }

    // List tidak berurutan: - item atau * item
    if (/^[\*\-\•]\s+/m.test(block)) {
      const items = block
        .split(/\n/)
        .map((line) => line.replace(/^[\*\-\•]\s+/, "").trim())
        .filter(Boolean)
        .map((li) => `<li>${formatInlineMarkdown(li)}</li>`)
        .join("")
      return `<ul>${items}</ul>`
    }

    // List berurutan: 1. item
    if (/^\d+\.\s+/m.test(block)) {
      const items = block
        .split(/\n/)
        .map((line) => line.replace(/^\d+\.\s+/, "").trim())
        .filter(Boolean)
        .map((li) => `<li>${formatInlineMarkdown(li)}</li>`)
        .join("")
      return `<ol>${items}</ol>`
    }

    // Paragraf biasa
    const formatted = formatInlineMarkdown(block).replace(/\n/g, "<br/>")
    return `<p>${formatted}</p>`
  })

  return htmlBlocks.join("\n")
}

export function cleanDescription(raw: any): string {
  if (!raw) return ""
  return String(raw)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { entity, items } = body

    if (!entity || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Parameter entity dan daftar items wajib diisi." },
        { status: 400 }
      )
    }

    if (items.length > 2000) {
      return NextResponse.json(
        { success: false, message: "Ukuran batch per HTTP request melebihi batas 2.000 baris." },
        { status: 400 }
      )
    }

    let insertedCount = 0
    const errors: { row: number; title?: string; error: string }[] = []

    if (entity === "articles") {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const rowNum = i + 1
        const title = String(item.title || "").trim()
        let author = String(item.author || "Admin Employr").trim()
        if (!author || author.toLowerCase().includes("ambilcuti")) {
          author = "Admin Employr"
        }
        const content = formatArticleContent(String(item.content || "").trim())

        if (!title || !content) {
          errors.push({ row: rowNum, title: title || `Baris ${rowNum}`, error: "Judul dan Konten wajib diisi." })
          continue
        }

        try {
          let categoryId: string | null = null
          if (item.category && String(item.category).trim()) {
            const catName = String(item.category).trim()
            const catSlug = slugify(catName)
            let cat = await prisma.article_categories.findFirst({
              where: {
                OR: [{ name: { equals: catName, mode: "insensitive" } }, { slug: catSlug }],
              },
            })
            if (!cat) {
              cat = await prisma.article_categories.create({
                data: {
                  id: crypto.randomUUID(),
                  name: catName,
                  slug: catSlug,
                },
              })
            }
            categoryId = cat.id
          }

          const uniqueSlug = await resolveUniqueSlug(
            title,
            async (s) => Boolean(await prisma.articles.findUnique({ where: { slug: s }, select: { id: true } }))
          )
          const isPublished = parseBool(item.isPublished, true)

          await prisma.articles.create({
            data: {
              title,
              slug: uniqueSlug,
              author,
              content,
              category_id: categoryId,
              cover_image_url: item.coverImageUrl ? String(item.coverImageUrl).trim() : null,
              tags: parseTags(item.tags),
              is_published: isPublished,
              published_at: isPublished ? new Date() : null,
              source: "bulk_import",
            },
          })
          insertedCount++
        } catch (e: any) {
          errors.push({ row: rowNum, title, error: e.message || "Gagal menyimpan artikel." })
        }
      }
    } else if (entity === "jobs") {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const rowNum = i + 1
        const title = String(item.title || "").trim()
        const company = String(item.company || "").trim()
        const externalUrl = String(item.externalUrl || "").trim()

        if (!title || !company) {
          errors.push({ row: rowNum, title: title || `Baris ${rowNum}`, error: "Posisi dan Nama Perusahaan wajib diisi." })
          continue
        }

        try {
          // Find or create company
          let companyRecord = await prisma.companies.findFirst({
            where: { name: { equals: company, mode: "insensitive" } },
          })
          if (!companyRecord) {
            const compSlug = await resolveUniqueSlug(
              company,
              async (s) => Boolean(await prisma.companies.findUnique({ where: { slug: s }, select: { id: true } }))
            )
            companyRecord = await prisma.companies.create({
              data: {
                id: crypto.randomUUID(),
                name: company,
                slug: compSlug,
                website: externalUrl || null,
              },
            })
          }

          const validWorkTypes = ["ONSITE", "REMOTE", "HYBRID", "ONLINE"]
          const rawWorkType = String(item.workType || "ONSITE").toUpperCase().trim()
          const workType = validWorkTypes.includes(rawWorkType) ? rawWorkType : "ONSITE"
          const locStr = String(item.location || "Indonesia").trim()

          const jobSlug = await resolveUniqueSlug(
            `${title}-${company}`,
            async (s) => Boolean(await prisma.jobs.findUnique({ where: { slug: s }, select: { id: true } })),
            locStr !== "Indonesia" ? locStr : undefined
          )
          const salaryMin = item.salaryMin ? Number(String(item.salaryMin).replace(/[^0-9]/g, "")) : null
          const salaryMax = item.salaryMax ? Number(String(item.salaryMax).replace(/[^0-9]/g, "")) : null

          await prisma.jobs.create({
            data: {
              id: crypto.randomUUID(),
              company_id: companyRecord.id,
              title,
              slug: jobSlug,
              description: cleanDescription(item.description) || `Lowongan ${title} di ${company}`,
              location: locStr,
              work_type: workType as any,
              salary_min: salaryMin || null,
              salary_max: salaryMax || null,
              salary_period: "MONTH",
              external_url: externalUrl || "https://loker.employr.id",
              source: "bulk_import",
              tags: parseTags(item.tags),
              is_active: parseBool(item.isActive, true),
            },
          })
          insertedCount++
        } catch (e: any) {
          errors.push({ row: rowNum, title, error: e.message || "Gagal menyimpan lowongan." })
        }
      }
    } else if (entity === "courses") {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const rowNum = i + 1
        const title = String(item.title || "").trim()
        const instructor = String(item.instructor || "").trim()
        const externalUrl = String(item.externalUrl || "").trim()

        if (!title || !instructor) {
          errors.push({ row: rowNum, title: title || `Baris ${rowNum}`, error: "Judul dan Instruktur wajib diisi." })
          continue
        }

        try {
          const courseSlug = await resolveUniqueSlug(
            title,
            async (s) => Boolean(await prisma.courses.findUnique({ where: { slug: s }, select: { id: true } })),
            instructor
          )
          const price = item.price ? Number(String(item.price).replace(/[^0-9]/g, "")) : 0
          const duration = item.durationHours ? Number(String(item.durationHours).replace(/[^0-9]/g, "")) : 1

          await prisma.courses.create({
            data: {
              title,
              slug: courseSlug,
              description: cleanDescription(item.description) || `Kursus ${title} oleh ${instructor}`,
              instructor,
              level: String(item.level || "Pemula").trim(),
              price: isNaN(price) ? 0 : price,
              duration_hours: isNaN(duration) || duration <= 0 ? 1 : duration,
              external_url: externalUrl || "https://loker.employr.id",
              cover_image_url: item.coverImageUrl ? String(item.coverImageUrl).trim() : null,
              tags: parseTags(item.tags),
              is_active: parseBool(item.isActive, true),
            },
          })
          insertedCount++
        } catch (e: any) {
          errors.push({ row: rowNum, title, error: e.message || "Gagal menyimpan kursus." })
        }
      }
    } else if (entity === "certifications") {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const rowNum = i + 1
        const title = String(item.title || "").trim()
        const provider = String(item.provider || "").trim()
        const externalUrl = String(item.externalUrl || "").trim()

        if (!title || !provider) {
          errors.push({ row: rowNum, title: title || `Baris ${rowNum}`, error: "Nama Sertifikasi dan Penyelenggara wajib diisi." })
          continue
        }

        try {
          const certSlug = await resolveUniqueSlug(
            title,
            async (s) => Boolean(await prisma.certifications.findUnique({ where: { slug: s }, select: { id: true } })),
            provider
          )
          const price = item.price ? Number(String(item.price).replace(/[^0-9]/g, "")) : 0
          const duration = item.durationHours ? Number(String(item.durationHours).replace(/[^0-9]/g, "")) : 1

          await prisma.certifications.create({
            data: {
              title,
              slug: certSlug,
              description: cleanDescription(item.description) || `Sertifikasi ${title} dari ${provider}`,
              provider,
              price: isNaN(price) ? 0 : price,
              duration_hours: isNaN(duration) || duration <= 0 ? 1 : duration,
              external_url: externalUrl || "https://loker.employr.id",
              cover_image_url: item.coverImageUrl ? String(item.coverImageUrl).trim() : null,
              tags: parseTags(item.tags),
              is_active: parseBool(item.isActive, true),
              source: "bulk_import",
            },
          })
          insertedCount++
        } catch (e: any) {
          errors.push({ row: rowNum, title, error: e.message || "Gagal menyimpan sertifikasi." })
        }
      }
    } else if (entity === "events") {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const rowNum = i + 1
        const title = String(item.title || "").trim()
        const location = String(item.location || "").trim()
        const externalUrl = String(item.externalUrl || "").trim()

        if (!title || !location) {
          errors.push({ row: rowNum, title: title || `Baris ${rowNum}`, error: "Nama Event dan Lokasi wajib diisi." })
          continue
        }

        try {
          const eventSlug = await resolveUniqueSlug(
            title,
            async (s) => Boolean(await prisma.events.findUnique({ where: { slug: s }, select: { id: true } })),
            location.split(",")[0]
          )
          const validTypes = ["ONLINE", "HYBRID", "ONSITE"]
          const rawType = String(item.type || "ONLINE").toUpperCase().trim()
          const eventType = validTypes.includes(rawType) ? rawType : "ONLINE"

          let parsedDate = new Date()
          if (item.eventDate) {
            const d = new Date(item.eventDate)
            if (!isNaN(d.getTime())) parsedDate = d
          }

          await prisma.events.create({
            data: {
              title,
              slug: eventSlug,
              description: cleanDescription(item.description) || `Event ${title} di ${location}`,
              event_date: parsedDate,
              location,
              type: eventType as any,
              external_url: externalUrl || "https://loker.employr.id",
              cover_image_url: item.coverImageUrl ? String(item.coverImageUrl).trim() : null,
              tags: parseTags(item.tags),
              is_active: parseBool(item.isActive, true),
              source: "bulk_import",
            },
          })
          insertedCount++
        } catch (e: any) {
          errors.push({ row: rowNum, title, error: e.message || "Gagal menyimpan event." })
        }
      }
    } else {
      return NextResponse.json(
        { success: false, message: `Entity "${entity}" tidak dikenali.` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${insertedCount} dari ${items.length} data.`,
      insertedCount,
      failedCount: errors.length,
      errors: errors.slice(0, 50),
    })
  } catch (error: any) {
    console.error("[CMS Bulk Insert Error]:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Terjadi kesalahan sistem saat memproses bulk insert." },
      { status: 500 }
    )
  }
}
