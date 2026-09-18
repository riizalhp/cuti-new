import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@employr/db";
import crypto from "crypto";

function slugify(text: string): string {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "") || "loker"
  );
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const source = url.searchParams.get("source") || "all";
    const status = url.searchParams.get("status") || "all";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 200);

    const where: Record<string, unknown> = {};
    if (source === "manual") where.source = "manual";
    else if (source !== "all") where.source = source;
    if (status === "active") where.is_active = true;
    else if (status === "inactive") where.is_active = false;

    const jobs = await prisma.jobs.findMany({
      where,
      include: { companies: true },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    const [scrapedActive, manualActive, inactive, bySource] = await Promise.all([
      prisma.jobs.count({ where: { is_active: true, source: { not: "manual" } } }),
      prisma.jobs.count({ where: { is_active: true, source: "manual" } }),
      prisma.jobs.count({ where: { is_active: false } }),
      prisma.jobs.groupBy({
        by: ["source"],
        where: { is_active: true },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        scrapedActive,
        manualActive,
        inactive,
        bySource: bySource
          .map((s) => ({ source: s.source, count: s._count._all }))
          .sort((a, b) => b.count - a.count),
      },
      data: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        slug: j.slug,
        company: j.companies?.name ?? "-",
        location: j.location,
        workType: j.work_type,
        externalUrl: j.external_url,
        source: j.source,
        tags: j.tags ?? [],
        isActive: j.is_active,
        lastSyncedAt: j.last_synced_at ? j.last_synced_at.toISOString() : null,
        createdAt: j.created_at.toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal mengambil lowongan" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cms/jobs — aktif/nonaktifkan lowongan (toggle is_active)
 * Body: { id, isActive }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "id dan isActive wajib diisi" },
        { status: 400 }
      );
    }

    const job = await prisma.jobs.update({
      where: { id },
      data: { is_active: isActive },
    });

    return NextResponse.json({ success: true, data: { id: job.id, isActive: job.is_active } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal mengubah status lowongan" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cms/jobs?id=... — hapus lowongan permanen
 */
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id wajib diisi" },
        { status: 400 }
      );
    }

    await prisma.jobs.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal menghapus lowongan" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cms/jobs — Tambah lowongan kerja manual dari CMS Admin
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      company,
      location,
      workType = "ONSITE",
      salaryMin,
      salaryMax,
      description,
      externalUrl,
      tags,
      isActive = true,
      source = "manual",
    } = body;

    if (!title?.trim() || !company?.trim()) {
      return NextResponse.json(
        { success: false, message: "Judul lowongan dan nama perusahaan wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Find or create company
    const trimmedCompany = company.trim();
    let companyRecord = await prisma.companies.findFirst({
      where: { name: { equals: trimmedCompany, mode: "insensitive" } },
    });

    if (!companyRecord) {
      const companySlug = `${slugify(trimmedCompany)}-${crypto.randomBytes(3).toString("hex")}`;
      companyRecord = await prisma.companies.create({
        data: {
          id: crypto.randomUUID(),
          name: trimmedCompany,
          slug: companySlug,
          website: externalUrl ? String(externalUrl).trim() : null,
        },
      });
    }

    // 2. Create job
    const jobSlug = `${slugify(title.trim())}-${crypto.randomBytes(3).toString("hex")}`;
    const validWorkTypes = ["ONSITE", "REMOTE", "HYBRID", "ONLINE"];
    const finalWorkType = validWorkTypes.includes(workType) ? workType : "ONSITE";

    const job = await prisma.jobs.create({
      data: {
        id: crypto.randomUUID(),
        company_id: companyRecord.id,
        title: title.trim(),
        slug: jobSlug,
        description: description?.trim() || `Lowongan ${title} di ${trimmedCompany}`,
        location: location?.trim() || "Indonesia",
        work_type: finalWorkType as any,
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        salary_period: "MONTH",
        external_url: externalUrl?.trim() || "https://employr.id",
        source: source || "manual",
        tags: Array.isArray(tags) ? tags : [],
        is_active: isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lowongan kerja berhasil ditambahkan ke CMS dan Portal Loker.",
      data: {
        id: job.id,
        title: job.title,
        company: companyRecord.name,
        location: job.location,
        workType: job.work_type,
        isActive: job.is_active,
      },
    });
  } catch (error: any) {
    console.error("[CMS Jobs POST Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menambahkan lowongan kerja." },
      { status: 500 }
    );
  }
}
