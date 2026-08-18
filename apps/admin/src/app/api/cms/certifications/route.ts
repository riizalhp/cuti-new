import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  try {
    const certs = await prisma.certifications.findMany({
      orderBy: { created_at: "desc" },
    });

    const formatted = certs.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      provider: c.provider,
      price: c.price,
      durationHours: c.duration_hours,
      isActive: c.is_active,
      externalUrl: c.external_url,
      coverImageUrl: c.cover_image_url,
      createdAt: c.created_at.toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal mengambil sertifikasi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      provider,
      price,
      durationHours,
      externalUrl,
      coverImageUrl,
      isActive,
    } = body;

    if (!title || !description || !provider || !externalUrl) {
      return NextResponse.json(
        { success: false, message: "Judul, deskripsi, penyelenggara, dan link wajib diisi" },
        { status: 400 }
      );
    }

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.certifications.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const cert = await prisma.certifications.create({
      data: {
        title,
        slug,
        description,
        provider,
        price: price ?? 0,
        duration_hours: durationHours ?? 1,
        external_url: externalUrl,
        cover_image_url: coverImageUrl ?? null,
        is_active: isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: cert.id,
        title: cert.title,
        slug: cert.slug,
        provider: cert.provider,
        price: cert.price,
        durationHours: cert.duration_hours,
        isActive: cert.is_active,
        externalUrl: cert.external_url,
        createdAt: cert.created_at.toISOString().split("T")[0],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal membuat sertifikasi" },
      { status: 500 }
    );
  }
}
