import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@employr/db";
import crypto from "crypto";

function slugify(text: string, maxLen = 100): string {
  const raw = text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!raw) return "loker";
  if (raw.length <= maxLen) return raw;
  const cut = raw.slice(0, maxLen);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, "");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await prisma.jobs.findUnique({
      where: { id },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true,
            location: true,
            industry: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Lowongan kerja tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        slug: job.slug,
        company: job.companies?.name ?? "",
        companyId: job.company_id,
        location: job.location,
        workType: job.work_type,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        description: job.description,
        externalUrl: job.external_url,
        tags: job.tags ?? [],
        isActive: job.is_active,
        source: job.source,
        createdAt: job.created_at.toISOString().split("T")[0],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal memuat detail lowongan" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      company,
      location,
      workType,
      salaryMin,
      salaryMax,
      description,
      externalUrl,
      tags,
      isActive,
    } = body;

    const existing = await prisma.jobs.findUnique({
      where: { id },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true,
            location: true,
            industry: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Lowongan kerja tidak ditemukan" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (title !== undefined) data.title = title.trim();
    if (location !== undefined) data.location = location.trim();
    if (description !== undefined) data.description = description.trim();
    if (salaryMin !== undefined) data.salary_min = salaryMin ? Number(salaryMin) : null;
    if (salaryMax !== undefined) data.salary_max = salaryMax ? Number(salaryMax) : null;
    if (externalUrl !== undefined) data.external_url = externalUrl.trim();
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
    if (isActive !== undefined) data.is_active = isActive;

    const validWorkTypes = ["ONSITE", "REMOTE", "HYBRID", "ONLINE"];
    if (workType && validWorkTypes.includes(workType)) {
      data.work_type = workType;
    }

    // Handle company update if changed
    if (company && company.trim() && company.trim().toLowerCase() !== existing.companies?.name?.toLowerCase()) {
      const trimmedCompany = company.trim();
      let companyRecord = await prisma.companies.findFirst({
        where: { name: { equals: trimmedCompany, mode: "insensitive" } },
      });

      if (!companyRecord) {
        const baseCompSlug = slugify(trimmedCompany);
        let companySlug = baseCompSlug;
        let cCount = 2;
        while (await prisma.companies.findUnique({ where: { slug: companySlug }, select: { id: true } })) {
          companySlug = `${baseCompSlug}-${cCount++}`;
        }
        companyRecord = await prisma.companies.create({
          data: {
            id: crypto.randomUUID(),
            name: trimmedCompany,
            slug: companySlug,
            website: externalUrl ? String(externalUrl).trim() : null,
          },
        });
      }
      data.company_id = companyRecord.id;
    }

    const updated = await prisma.jobs.update({
      where: { id },
      data,
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true,
            location: true,
            industry: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        company: updated.companies?.name ?? "",
        location: updated.location,
        workType: updated.work_type,
        isActive: updated.is_active,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal memperbarui lowongan" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.jobs.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Lowongan kerja tidak ditemukan" },
        { status: 404 }
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
