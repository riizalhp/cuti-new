import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@employr/db";
import { sendArticleNewsletterBlast } from "@/lib/newsletter-service";

function slugify(text: string, maxLen = 100): string {
  const raw = text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!raw) return "artikel";
  if (raw.length <= maxLen) return raw;
  const cut = raw.slice(0, maxLen);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, "");
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
      tags: a.tags ?? [],
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
      tags,
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
        tags: Array.isArray(tags) ? tags : [],
        is_published: isPublished ?? false,
        published_at: isPublished ? new Date() : null,
      },
      include: { article_categories: true },
    });

    if (article.is_published) {
      sendArticleNewsletterBlast(article.id).catch((err) => {
        console.error('[Newsletter Blast Error on Create]:', err);
      });
    }

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
