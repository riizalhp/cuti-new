import { NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export interface TemplateMetadata {
  id: string;
  name: string;
  badge: string;
  description: string;
  iconColor: string;
}

export const KNOWN_TEMPLATES: Record<string, TemplateMetadata> = {
  "ats-modern": {
    id: "ats-modern",
    name: "ATS Modern Standard",
    badge: "1 Column ATS",
    description: "Format tunggal paling optimal untuk sistem ATS HRD BUMN & Multinasional.",
    iconColor: "bg-blue-600 text-white",
  },
  "ats-modern-standard": {
    id: "ats-modern-standard",
    name: "ATS Modern Standard",
    badge: "1 Column ATS",
    description: "Format tunggal paling optimal untuk sistem ATS HRD BUMN & Multinasional.",
    iconColor: "bg-blue-600 text-white",
  },
  "ketat-serif": {
    id: "ketat-serif",
    name: "Ketat Ruled Serif",
    badge: "Classic Serif",
    description: "Format serif ringkas dengan garis pemisah (ruled heading) perbankan & hukum.",
    iconColor: "bg-slate-800 text-white",
  },
  "luasa-minimal": {
    id: "luasa-minimal",
    name: "Luasa Airy Minimalist",
    badge: "Minimalist",
    description: "Tampilan bersih dengan spasi antar elemen yang lega untuk profesional.",
    iconColor: "bg-sky-600 text-white",
  },
  "tebal-bold": {
    id: "tebal-bold",
    name: "Tebal Bold Statement",
    badge: "Bold ATS",
    description: "Template tegas dengan nama besar & blok judul uppercase hitam.",
    iconColor: "bg-slate-900 text-white",
  },
  "harvard-modern": {
    id: "harvard-modern",
    name: "Harvard Modern Grid",
    badge: "2 Column Grid",
    description: "Layout 2 kolom dengan grid date-content yang rapi khas HBS.",
    iconColor: "bg-slate-900 text-white",
  },
  "rezi-classic": {
    id: "rezi-classic",
    name: "Rezi Classic Serif",
    badge: "Academic",
    description: "Font serif klasik untuk posisi akademis, legal, dan consulting.",
    iconColor: "bg-blue-800 text-white",
  },
  "minimalist-executive": {
    id: "minimalist-executive",
    name: "Minimalist Executive",
    badge: "Executive",
    description: "Desain bersih dengan tata letak ringkas & elegan untuk manajerial.",
    iconColor: "bg-slate-800 text-white",
  },
  "creative-tech": {
    id: "creative-tech",
    name: "Creative Tech & Digital",
    badge: "Tech & Product",
    description: "Menonjolkan tech stack, sertifikasi profesional, dan portofolio.",
    iconColor: "bg-emerald-600 text-white",
  },
  "resumify-tech-sidebar": {
    id: "resumify-tech-sidebar",
    name: "Split Dark Sidebar",
    badge: "Split Sidebar",
    description: "Layout 2 kolom dengan sidebar kiri gelap khusus keahlian IT.",
    iconColor: "bg-slate-900 text-white",
  },
  "studio-timeline": {
    id: "studio-timeline",
    name: "Chronological Timeline",
    badge: "Timeline Visual",
    description: "Menampilkan riwayat karir dalam alur timeline vertikal interaktif.",
    iconColor: "bg-indigo-600 text-white",
  },
  "studio-accent-tabs": {
    id: "studio-accent-tabs",
    name: "Accent Tab Headings",
    badge: "Tab Headings",
    description: "Judul seksi berbentuk tab persegi berwarna yang terstruktur rapi.",
    iconColor: "bg-indigo-500 text-white",
  },
  "builder-creative-box": {
    id: "builder-creative-box",
    name: "Boxed Section Container",
    badge: "Box Container",
    description: "Setiap bagian terbungkus dalam kontainer bingkai terstruktur.",
    iconColor: "bg-emerald-700 text-white",
  },
  "builder-two-column": {
    id: "builder-two-column",
    name: "Equal 50:50 Split Grid",
    badge: "50:50 Split",
    description: "Layout 2 kolom seimbang 50:50 memaksimalkan 1 halaman A4.",
    iconColor: "bg-indigo-800 text-white",
  },
  "impact-professional": {
    id: "impact-professional",
    name: "Left Border Accent Highlight",
    badge: "Left Border Accent",
    description: "Header bergaris tegas dengan aksen border kiri pada setiap poin kerja.",
    iconColor: "bg-blue-600 text-white",
  },
};

function normalizeTemplateId(id?: string | null): string {
  if (!id) return "ats-modern";
  const cleaned = id.trim().toLowerCase();
  if (cleaned === "ats-modern-standard" || cleaned === "ats-standard" || cleaned === "default") {
    return "ats-modern";
  }
  return cleaned;
}

export async function GET() {
  try {
    // 1. Ambil semua data CV projects untuk menghitung jumlah penggunaan per template
    const cvProjects = await prisma.cv_projects.findMany({
      select: {
        id: true,
        template_id: true,
        data: true,
        created_at: true,
        updated_at: true,
      },
    });

    // 2. Ambil semua audit logs untuk event download CV
    const downloadLogs = await prisma.audit_logs.findMany({
      where: {
        action: "CV_DOWNLOAD",
      },
      orderBy: { created_at: "desc" },
      include: {
        users: { select: { name: true, email: true } },
      },
    });

    // Inisialisasi peta akumulasi template
    const statsMap: Record<
      string,
      {
        id: string;
        name: string;
        badge: string;
        description: string;
        iconColor: string;
        usedCount: number;
        downloadCount: number;
        lastUsedAt: string | null;
        lastDownloadedAt: string | null;
      }
    > = {};

    // Register all standard templates
    Object.values(KNOWN_TEMPLATES).forEach((tpl) => {
      const canonicalId = normalizeTemplateId(tpl.id);
      if (!statsMap[canonicalId]) {
        statsMap[canonicalId] = {
          id: canonicalId,
          name: tpl.name,
          badge: tpl.badge,
          description: tpl.description,
          iconColor: tpl.iconColor,
          usedCount: 0,
          downloadCount: 0,
          lastUsedAt: null,
          lastDownloadedAt: null,
        };
      }
    });

    // 3. Akumulasikan penggunaan (CV Created) dari cv_projects
    cvProjects.forEach((cv) => {
      const canonicalId = normalizeTemplateId(cv.template_id);
      if (!statsMap[canonicalId]) {
        statsMap[canonicalId] = {
          id: canonicalId,
          name: canonicalId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          badge: "Custom Template",
          description: "Template kustom pengguna",
          iconColor: "bg-slate-700 text-white",
          usedCount: 0,
          downloadCount: 0,
          lastUsedAt: null,
          lastDownloadedAt: null,
        };
      }

      statsMap[canonicalId].usedCount += 1;
      const cvCreated = cv.created_at.toISOString();
      if (!statsMap[canonicalId].lastUsedAt || cvCreated > statsMap[canonicalId].lastUsedAt!) {
        statsMap[canonicalId].lastUsedAt = cvCreated;
      }

      // Periksa juga jika ada data download_count yang tersimpan di JSON data cv_projects
      if (cv.data && typeof cv.data === "object") {
        const rawData = cv.data as Record<string, any>;
        if (typeof rawData.download_count === "number" && rawData.download_count > 0) {
          statsMap[canonicalId].downloadCount += rawData.download_count;
        }
      }
    });

    // 4. Akumulasikan jumlah unduhan dari audit_logs
    downloadLogs.forEach((log) => {
      let rawTplId = log.entity_id;
      if (log.new_value && typeof log.new_value === "object") {
        const val = log.new_value as Record<string, any>;
        if (val.template_id) rawTplId = val.template_id;
      }

      const canonicalId = normalizeTemplateId(rawTplId);
      if (!statsMap[canonicalId]) {
        statsMap[canonicalId] = {
          id: canonicalId,
          name: canonicalId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          badge: "Custom Template",
          description: "Template kustom pengguna",
          iconColor: "bg-slate-700 text-white",
          usedCount: 0,
          downloadCount: 0,
          lastUsedAt: null,
          lastDownloadedAt: null,
        };
      }

      statsMap[canonicalId].downloadCount += 1;
      const logTime = log.created_at.toISOString();
      if (!statsMap[canonicalId].lastDownloadedAt || logTime > statsMap[canonicalId].lastDownloadedAt!) {
        statsMap[canonicalId].lastDownloadedAt = logTime;
      }
    });

    // 5. Hitung total KPI & urutkan daftar template
    const templateList = Object.values(statsMap).map((tpl) => {
      const downloadRate =
        tpl.usedCount > 0 ? Math.round((tpl.downloadCount / tpl.usedCount) * 100) : tpl.downloadCount > 0 ? 100 : 0;
      return {
        ...tpl,
        downloadRate,
      };
    });

    // Urutkan berdasarkan yang paling sering di-download, kemudian paling sering digunakan
    templateList.sort((a, b) => {
      if (b.downloadCount !== a.downloadCount) {
        return b.downloadCount - a.downloadCount;
      }
      return b.usedCount - a.usedCount;
    });

    const totalCvCreated = cvProjects.length;
    const totalCvDownloaded = templateList.reduce((acc, curr) => acc + curr.downloadCount, 0);
    const overallConversionRate =
      totalCvCreated > 0 ? Math.round((totalCvDownloaded / totalCvCreated) * 100) : 0;

    const topDownloadedTemplate = templateList.length > 0 && templateList[0].downloadCount > 0 ? templateList[0] : templateList[0] || null;
    const topUsedTemplate = [...templateList].sort((a, b) => b.usedCount - a.usedCount)[0] || null;

    // 6. Format recent download activity logs
    const recentDownloads = downloadLogs.slice(0, 10).map((log) => {
      const payload = (typeof log.new_value === "object" && log.new_value !== null ? log.new_value : {}) as Record<string, any>;
      const tplId = normalizeTemplateId(payload.template_id || log.entity_id);
      const meta = KNOWN_TEMPLATES[tplId] || { name: tplId, badge: "Standard" };

      return {
        id: log.id,
        userName: log.users?.name || "Pengguna",
        userEmail: log.users?.email || "",
        templateId: tplId,
        templateName: meta.name,
        format: (payload.format || "pdf").toUpperCase(),
        cvTitle: payload.title || "CV",
        downloadedAt: log.created_at.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTemplates: templateList.length,
          totalCvCreated,
          totalCvDownloaded,
          overallConversionRate,
          topDownloadedTemplate,
          topUsedTemplate,
        },
        templates: templateList,
        recentDownloads,
      },
    });
  } catch (error: any) {
    console.error("[CV Template Stats API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat analitik template CV." },
      { status: 500 }
    );
  }
}
