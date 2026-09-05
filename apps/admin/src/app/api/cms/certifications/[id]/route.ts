import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const existing = await prisma.certifications.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Sertifikasi tidak ditemukan" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (provider !== undefined) data.provider = provider;
    if (price !== undefined) data.price = price;
    if (durationHours !== undefined) data.duration_hours = durationHours;
    if (externalUrl !== undefined) data.external_url = externalUrl;
    if (coverImageUrl !== undefined) data.cover_image_url = coverImageUrl;
    if (isActive !== undefined) data.is_active = isActive;

    const cert = await prisma.certifications.update({
      where: { id },
      data,
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
      { success: false, message: error?.message ?? "Gagal memperbarui sertifikasi" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.certifications.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Sertifikasi tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.certifications.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal menghapus sertifikasi" },
      { status: 500 }
    );
  }
}
