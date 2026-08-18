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
    const articles = await prisma.articles.findMany({
      orderBy: { published_at: "desc" },
      include: { article_categories: true },
    });

    const formatted = articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      author: a.author,
      category: a.article_categories?.name ?? null,
      categoryId: a.category_id ?? null,
      isPublished: a.is_published,
      publishedAt: a.published_at ? a.published_at.toISOString().split("T")[0] : null,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal mengambil artikel" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      author,
      content,
      categoryId,
      coverImageUrl,
      isPublished,
    } = body;

    if (!title || !author || !content) {
      return NextResponse.json(
        { success: false, message: "Judul, penulis, dan konten wajib diisi" },
        { status: 400 }
      );
    }

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.articles.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const article = await prisma.articles.create({
      data: {
        title,
        slug,
        author,
        content,
        category_id: categoryId ?? null,
        cover_image_url: coverImageUrl ?? null,
        is_published: isPublished ?? false,
        published_at: isPublished ? new Date() : null,
      },
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
      { success: false, message: error?.message ?? "Gagal membuat artikel" },
      { status: 500 }
    );
  }
}
