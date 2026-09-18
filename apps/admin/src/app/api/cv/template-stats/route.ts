import { NextResponse } from "next/server";
import { prisma } from "@employr/db";

export interface TemplateMetadata {
  id: string;
  name: string;
  badge: string;
  description: string;
  iconColor: string;
  features: string[];
}

export const KNOWN_TEMPLATES: Record<string, TemplateMetadata> = {
  "ats-modern": {
    id: "ats-modern",
    name: "ATS Modern Standard",
    badge: "1 Column ATS",
    description: "Format tunggal paling optimal untuk sistem ATS HRD BUMN & Multinasional. Memaksimalkan pembacaan kata kunci.",
    iconColor: "bg-blue-600 text-white",
    features: ["100% Parsing ATS Friendly", "Font Standar Internasional", "Hierarki Pengalaman Jelas"],
  },
  "ketat-serif": {
    id: "ketat-serif",
    name: "Ketat Ruled Serif",
    badge: "Classic Serif",
    description: "Format serif ringkas dengan garis pemisah (ruled heading). Sangat disukai industri Perbankan, Hukum, & BUMN.",
    iconColor: "bg-slate-800 text-white",
    features: ["Garis Pemisah Ruled Heading", "Font Serif Formal", "Tata Letak Padat & Rapi"],
  },
  "luasa-minimal": {
    id: "luasa-minimal",
    name: "Luasa Airy Minimalist",
    badge: "Minimalist",
    description: "Tampilan bersih dengan spasi antar elemen yang lega dan letterspaced heading. Cocok untuk Profesional & Manager.",
    iconColor: "bg-sky-600 text-white",
    features: ["Spasi Elemen Lega", "Letterspaced Headings", "Desain Modern & Clean"],
  },
  "harvard-modern": {
    id: "harvard-modern",
    name: "Harvard Modern Grid",
    badge: "2 Column Grid",
    description: "Layout 2 kolom dengan grid date-content yang rapi. Terinspirasi dari format resume Harvard Business School.",
    iconColor: "bg-slate-900 text-white",
    features: ["Grid Layout Professional", "Date di Kolom Kiri", "Minimal & Clean"],
  },
  "rezi-classic": {
    id: "rezi-classic",
    name: "Rezi Classic Serif",
    badge: "Academic",
    description: "Font serif klasik dengan layout tradisional. Sangat cocok untuk posisi akademis, legal, dan consulting.",
    iconColor: "bg-blue-800 text-white",
    features: ["Font Serif Klasik", "Traditional Layout", "Formal & Authoritative"],
  },
  "minimalist-executive": {
    id: "minimalist-executive",
    name: "Minimalist Executive",
    badge: "Executive",
    description: "Desain bersih dengan tata letak ringkas & elegan. Sangat cocok untuk posisi Manajerial, Finansial, & Konsultan.",
    iconColor: "bg-slate-800 text-white",
    features: ["Ringkasan Eksekutif Dominan", "Garis Pemisah Minimalis", "Tampilan Rapi & Formal"],
  },
};

export interface PurposeMetadata {
  id: string;
  title: string;
  badge: string;
  category: string;
  categoryTitle: string;
  color: string;
}

export const KNOWN_PURPOSES: Record<string, PurposeMetadata> = {
  job: {
    id: "job",
    title: "Lamar Kerja",
    badge: "Full-Time Professional",
    category: "career",
    categoryTitle: "Karier & Profesional",
    color: "#1738D1",
  },
  internship: {
    id: "internship",
    title: "Magang / Internship",
    badge: "Mahasiswa & Pemula",
    category: "entry",
    categoryTitle: "Pemula & Mahasiswa",
    color: "#059669",
  },
  fresh_graduate: {
    id: "fresh_graduate",
    title: "Fresh Graduate",
    badge: "Lulusan Baru",
    category: "entry",
    categoryTitle: "Pemula & Mahasiswa",
    color: "#10B981",
  },
  freelance: {
    id: "freelance",
    title: "Freelance & Kontrak",
    badge: "Pekerja Lepas",
    category: "flexible",
    categoryTitle: "Format Fleksibel",
    color: "#8B5CF6",
  },
  remote: {
    id: "remote",
    title: "Remote Work Global",
    badge: "Kerja Jarak Jauh",
    category: "flexible",
    categoryTitle: "Format Fleksibel",
    color: "#6366F1",
  },
  career_switch: {
    id: "career_switch",
    title: "Career Switch",
    badge: "Pindah Bidang",
    category: "career",
    categoryTitle: "Karier & Profesional",
    color: "#F97316",
  },
  promotion: {
    id: "promotion",
    title: "Promosi Internal",
    badge: "Naik Jabatan",
    category: "career",
    categoryTitle: "Karier & Profesional",
    color: "#D97706",
  },
  academic_scholarship: {
    id: "academic_scholarship",
    title: "Beasiswa & Studi",
    badge: "Akademik",
    category: "academic",
    categoryTitle: "Akademik & Beasiswa",
    color: "#0284C7",
  },
  overseas: {
    id: "overseas",
    title: "Kerja Luar Negeri",
    badge: "Internasional",
    category: "career",
    categoryTitle: "Karier & Profesional",
    color: "#0EA5E9",
  },
  general: {
    id: "general",
    title: "Umum / All-Rounder",
    badge: "Serbaguna",
    category: "flexible",
    categoryTitle: "Format Fleksibel",
    color: "#64748B",
  },
  volunteer_ngo: {
    id: "volunteer_ngo",
    title: "Volunteer & NGO",
    badge: "Sosial & Nirlaba",
    category: "social",
    categoryTitle: "Sosial & Nonprofit",
    color: "#14B8A6",
  },
  government: {
    id: "government",
    title: "BUMN & Kedinasan",
    badge: "Sektor Publik / ASN",
    category: "public",
    categoryTitle: "Sektor Publik",
    color: "#E11D48",
  },
  executive: {
    id: "executive",
    title: "Eksekutif & Manajerial",
    badge: "Pimpinan / C-Level",
    category: "leadership",
    categoryTitle: "Kepemimpinan",
    color: "#334155",
  },
  startup_founder: {
    id: "startup_founder",
    title: "Startup & Founder",
    badge: "Wirausaha & Rintisan",
    category: "leadership",
    categoryTitle: "Kepemimpinan",
    color: "#F59E0B",
  },
  career_break: {
    id: "career_break",
    title: "Kembali Bekerja",
    badge: "Career Re-entry",
    category: "transition",
    categoryTitle: "Transisi Khusus",
    color: "#EC4899",
  },
};

function normalizeTemplateId(id?: string | null): string {
  if (!id) return "ats-modern";
  const cleaned = id.trim().toLowerCase();
  if (
    cleaned === "ats-modern-standard" ||
    cleaned === "ats-standard" ||
    cleaned === "default"
  ) {
    return "ats-modern";
  }
  if (KNOWN_TEMPLATES[cleaned]) {
    return cleaned;
  }
  return "ats-modern";
}

export function normalizePurposeId(raw?: string | null): string {
  if (!raw) return "job";
  const cleaned = raw.trim().toLowerCase().replace(/-/g, "_");
  if (KNOWN_PURPOSES[cleaned]) {
    return cleaned;
  }
  if (cleaned === "fresh_grad" || cleaned === "freshgrad") return "fresh_graduate";
  if (cleaned === "bumn" || cleaned === "asn" || cleaned === "pns" || cleaned === "kedinasan") return "government";
  if (cleaned === "beasiswa" || cleaned === "scholarship" || cleaned === "academic") return "academic_scholarship";
  if (cleaned === "intern" || cleaned === "magang") return "internship";
  if (cleaned === "founder" || cleaned === "startup") return "startup_founder";
  if (cleaned === "ngo" || cleaned === "volunteer") return "volunteer_ngo";
  if (cleaned === "re_entry" || cleaned === "break") return "career_break";
  return "job";
}

export async function GET() {
  try {
    // 1. Ambil semua data CV projects untuk menghitung jumlah penggunaan per template & tujuan
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
    const templateStatsMap: Record<
      string,
      {
        id: string;
        name: string;
        badge: string;
        description: string;
        iconColor: string;
        features: string[];
        usedCount: number;
        downloadCount: number;
        lastUsedAt: string | null;
        lastDownloadedAt: string | null;
      }
    > = {};

    Object.values(KNOWN_TEMPLATES).forEach((tpl) => {
      const canonicalId = normalizeTemplateId(tpl.id);
      if (!templateStatsMap[canonicalId]) {
        templateStatsMap[canonicalId] = {
          id: canonicalId,
          name: tpl.name,
          badge: tpl.badge,
          description: tpl.description,
          iconColor: tpl.iconColor,
          features: tpl.features,
          usedCount: 0,
          downloadCount: 0,
          lastUsedAt: null,
          lastDownloadedAt: null,
        };
      }
    });

    // Inisialisasi peta akumulasi tujuan CV (15 Profil)
    const purposeStatsMap: Record<
      string,
      {
        id: string;
        title: string;
        badge: string;
        category: string;
        categoryTitle: string;
        color: string;
        count: number;
        percentage: number;
      }
    > = {};

    Object.values(KNOWN_PURPOSES).forEach((p) => {
      purposeStatsMap[p.id] = {
        id: p.id,
        title: p.title,
        badge: p.badge,
        category: p.category,
        categoryTitle: p.categoryTitle,
        color: p.color,
        count: 0,
        percentage: 0,
      };
    });

    // Peta tren harian (14 hari terakhir)
    const dailyMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = 0;
    }

    // 3. Akumulasikan data dari cv_projects
    cvProjects.forEach((cv) => {
      // Template usage
      const canonicalTplId = normalizeTemplateId(cv.template_id);
      if (templateStatsMap[canonicalTplId]) {
        templateStatsMap[canonicalTplId].usedCount += 1;
        const cvCreated = cv.created_at.toISOString();
        if (
          !templateStatsMap[canonicalTplId].lastUsedAt ||
          cvCreated > templateStatsMap[canonicalTplId].lastUsedAt!
        ) {
          templateStatsMap[canonicalTplId].lastUsedAt = cvCreated;
        }
      }

      // Purpose usage (ekstraksi dari data JSON)
      const dataObj =
        typeof cv.data === "object" && cv.data !== null
          ? (cv.data as Record<string, any>)
          : {};
      const rawPurpose = dataObj.purpose || dataObj.cvPurpose || "job";
      const canonicalPurpose = normalizePurposeId(rawPurpose);

      if (purposeStatsMap[canonicalPurpose]) {
        purposeStatsMap[canonicalPurpose].count += 1;
      } else if (purposeStatsMap.job) {
        purposeStatsMap.job.count += 1;
      }

      // Daily trend
      const dateKey = cv.created_at.toISOString().split("T")[0];
      if (dailyMap[dateKey] !== undefined) {
        dailyMap[dateKey] += 1;
      }
    });

    // 4. Akumulasikan unduhan dari audit_logs
    downloadLogs.forEach((log) => {
      let rawTplId = log.entity_id;
      if (log.new_value && typeof log.new_value === "object") {
        const val = log.new_value as Record<string, any>;
        if (val.template_id) rawTplId = val.template_id;
      }

      const canonicalId = normalizeTemplateId(rawTplId);
      if (templateStatsMap[canonicalId]) {
        templateStatsMap[canonicalId].downloadCount += 1;
        const logTime = log.created_at.toISOString();
        if (
          !templateStatsMap[canonicalId].lastDownloadedAt ||
          logTime > templateStatsMap[canonicalId].lastDownloadedAt!
        ) {
          templateStatsMap[canonicalId].lastDownloadedAt = logTime;
        }
      }
    });

    const totalCvCreated = cvProjects.length;

    // 5. Hitung persentase Tujuan CV dan urutkan
    const purposeList = Object.values(purposeStatsMap).map((p) => ({
      ...p,
      percentage:
        totalCvCreated > 0 ? Math.round((p.count / totalCvCreated) * 100) : 0,
    }));

    purposeList.sort((a, b) => b.count - a.count);

    // Hitung ringkasan kategori tujuan CV
    const categoryStatsMap: Record<
      string,
      { id: string; title: string; count: number; percentage: number; color: string }
    > = {
      career: { id: "career", title: "Karier & Profesional", count: 0, percentage: 0, color: "#1738D1" },
      entry: { id: "entry", title: "Pemula & Mahasiswa", count: 0, percentage: 0, color: "#059669" },
      flexible: { id: "flexible", title: "Format Fleksibel", count: 0, percentage: 0, color: "#8B5CF6" },
      academic: { id: "academic", title: "Akademik & Beasiswa", count: 0, percentage: 0, color: "#0284C7" },
      public: { id: "public", title: "Sektor Publik / BUMN", count: 0, percentage: 0, color: "#E11D48" },
      social: { id: "social", title: "Sosial & Nonprofit", count: 0, percentage: 0, color: "#14B8A6" },
      leadership: { id: "leadership", title: "Kepemimpinan & Bisnis", count: 0, percentage: 0, color: "#F59E0B" },
      transition: { id: "transition", title: "Transisi Khusus", count: 0, percentage: 0, color: "#EC4899" },
    };

    purposeList.forEach((p) => {
      if (categoryStatsMap[p.category]) {
        categoryStatsMap[p.category].count += p.count;
      }
    });

    const categoryList = Object.values(categoryStatsMap).map((c) => ({
      ...c,
      percentage:
        totalCvCreated > 0 ? Math.round((c.count / totalCvCreated) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // 6. Format Template List
    const templateList = Object.values(templateStatsMap).map((tpl) => {
      const downloadRate =
        tpl.usedCount > 0
          ? Math.round((tpl.downloadCount / tpl.usedCount) * 100)
          : tpl.downloadCount > 0
          ? 100
          : 0;
      return {
        ...tpl,
        downloadRate,
      };
    });

    templateList.sort((a, b) => {
      if (b.downloadCount !== a.downloadCount) {
        return b.downloadCount - a.downloadCount;
      }
      return b.usedCount - a.usedCount;
    });

    const totalCvDownloaded = templateList.reduce(
      (acc, curr) => acc + curr.downloadCount,
      0
    );
    const overallConversionRate =
      totalCvCreated > 0
        ? Math.round((totalCvDownloaded / totalCvCreated) * 100)
        : 0;

    const topDownloadedTemplate =
      templateList.length > 0 && templateList[0].downloadCount > 0
        ? templateList[0]
        : templateList[0] || null;
    const topUsedTemplate =
      [...templateList].sort((a, b) => b.usedCount - a.usedCount)[0] || null;

    const topPurpose =
      purposeList.length > 0 && purposeList[0].count > 0
        ? purposeList[0]
        : purposeList[0] || null;

    // 7. Format daily trend array untuk grafik Recharts
    const dailyTrend = Object.entries(dailyMap).map(([dateStr, count]) => {
      const d = new Date(dateStr);
      const label = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      return {
        date: dateStr,
        label,
        count,
      };
    });

    // 8. Format recent download activity logs
    const recentDownloads = downloadLogs.slice(0, 10).map((log) => {
      const payload = (
        typeof log.new_value === "object" && log.new_value !== null
          ? log.new_value
          : {}
      ) as Record<string, any>;
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
          topPurpose,
        },
        templates: templateList,
        purposes: purposeList,
        categories: categoryList,
        dailyTrend,
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
