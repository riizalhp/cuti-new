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
    const events = await prisma.events.findMany({
      orderBy: { event_date: "desc" },
    });

    const formatted = events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      eventDate: e.event_date.toISOString().split("T")[0],
      location: e.location,
      type: e.type,
      isActive: e.is_active,
      externalUrl: e.external_url,
      coverImageUrl: e.cover_image_url,
      createdAt: e.created_at.toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal mengambil event" },
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
      eventDate,
      location,
      type,
      externalUrl,
      coverImageUrl,
      isActive,
    } = body;

    if (!title || !description || !eventDate || !location || !externalUrl) {
      return NextResponse.json(
        { success: false, message: "Judul, deskripsi, tanggal, lokasi, dan link wajib diisi" },
        { status: 400 }
      );
    }

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.events.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const event = await prisma.events.create({
      data: {
        title,
        slug,
        description,
        event_date: new Date(eventDate),
        location,
        type: type ?? "ONLINE",
        external_url: externalUrl,
        cover_image_url: coverImageUrl ?? null,
        is_active: isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        eventDate: event.event_date.toISOString().split("T")[0],
        location: event.location,
        type: event.type,
        isActive: event.is_active,
        externalUrl: event.external_url,
        createdAt: event.created_at.toISOString().split("T")[0],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal membuat event" },
      { status: 500 }
    );
  }
}
