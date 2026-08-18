import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { title, author, content, categoryId, coverImageUrl, isPublished } = body;

    const existing = await prisma.articles.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (author !== undefined) data.author = author;
    if (content !== undefined) data.content = content;
    if (coverImageUrl !== undefined) data.cover_image_url = coverImageUrl;
    if (categoryId !== undefined) data.category_id = categoryId;
    if (isPublished !== undefined) {
      data.is_published = isPublished;
      data.published_at = isPublished ? (existing.published_at ?? new Date()) : null;
    }

    const article = await prisma.articles.update({
      where: { id: params.id },
      data,
      include: { article_categories: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        author: article.author,
        category: article.article_categories?.name ?? null,
        categoryId: article.category_id ?? null,
        isPublished: article.is_published,
        publishedAt: article.published_at
          ? article.published_at.toISOString().split("T")[0]
          : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal memperbarui artikel" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.articles.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.articles.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal menghapus artikel" },
      { status: 500 }
    );
  }
}
