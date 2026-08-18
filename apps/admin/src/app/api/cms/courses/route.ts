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
    const courses = await prisma.courses.findMany({
      orderBy: { created_at: "desc" },
    });

    const formatted = courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      instructor: c.instructor,
      level: c.level,
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
      { success: false, message: error?.message ?? "Gagal mengambil kursus" },
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
      instructor,
      level,
      price,
      durationHours,
      externalUrl,
      coverImageUrl,
      isActive,
    } = body;

    if (!title || !description || !instructor || !externalUrl) {
      return NextResponse.json(
        { success: false, message: "Judul, deskripsi, instruktur, dan link wajib diisi" },
        { status: 400 }
      );
    }

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.courses.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const course = await prisma.courses.create({
      data: {
        title,
        slug,
        description,
        instructor,
        level: level ?? "Pemula",
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
        id: course.id,
        title: course.title,
        slug: course.slug,
        instructor: course.instructor,
        level: course.level,
        price: course.price,
        durationHours: course.duration_hours,
        isActive: course.is_active,
        externalUrl: course.external_url,
        createdAt: course.created_at.toISOString().split("T")[0],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal membuat kursus" },
      { status: 500 }
    );
  }
}
