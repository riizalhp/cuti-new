import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existing = await prisma.events.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (eventDate !== undefined) data.event_date = new Date(eventDate);
    if (location !== undefined) data.location = location;
    if (type !== undefined) data.type = type;
    if (externalUrl !== undefined) data.external_url = externalUrl;
    if (coverImageUrl !== undefined) data.cover_image_url = coverImageUrl;
    if (isActive !== undefined) data.is_active = isActive;

    const event = await prisma.events.update({
      where: { id: params.id },
      data,
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
      { success: false, message: error?.message ?? "Gagal memperbarui event" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.events.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.events.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal menghapus event" },
      { status: 500 }
    );
  }
}
