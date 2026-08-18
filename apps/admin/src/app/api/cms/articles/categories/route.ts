import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function GET() {
  try {
    const categories = await prisma.article_categories.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      success: true,
      data: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.article_categories.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: true, data: { id: existing.id, name: existing.name, slug: existing.slug } });
    }

    const category = await prisma.article_categories.create({ data: { name, slug } });
    return NextResponse.json({ success: true, data: { id: category.id, name: category.name, slug: category.slug } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal membuat kategori" },
      { status: 500 }
    );
  }
}
