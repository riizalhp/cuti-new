import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existing = await prisma.courses.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Kursus tidak ditemukan" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (instructor !== undefined) data.instructor = instructor;
    if (level !== undefined) data.level = level;
    if (price !== undefined) data.price = price;
    if (durationHours !== undefined) data.duration_hours = durationHours;
    if (externalUrl !== undefined) data.external_url = externalUrl;
    if (coverImageUrl !== undefined) data.cover_image_url = coverImageUrl;
    if (isActive !== undefined) data.is_active = isActive;

    const course = await prisma.courses.update({
      where: { id: params.id },
      data,
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
      { success: false, message: error?.message ?? "Gagal memperbarui kursus" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.courses.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Kursus tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.courses.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal menghapus kursus" },
      { status: 500 }
    );
  }
}
