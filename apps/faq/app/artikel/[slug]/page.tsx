import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, FolderOpen, ChevronRight, ExternalLink, MessageSquareText, Search } from "lucide-react";
import { OpenChatButton } from "@/components/OpenChatButton";
import {
  getArticleBySlug,
  getArticlesByCategory,
  getCategory,
  loadArticles,
  renderMarkdown,
} from "@employr/faq";
import { SITE_URL } from "@/lib/site";
import { ArticleCard } from "@/components/ArticleCard";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return loadArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };
  const canonicalUrl = `${SITE_URL}/artikel/${article.slug}`;

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/artikel/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: canonicalUrl,
      publishedTime: article.updatedAt,
      modifiedTime: article.updatedAt,
      images: [
        {
          url: "/logo.webp",
          width: 800,
          height: 600,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: ["/logo.webp"],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const category = getCategory(article.category);
  const related = getArticlesByCategory(article.category)
    .filter((a) => a.slug !== article.slug)
    .slice(0, 4);
  const html = renderMarkdown(article.body);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.updatedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: "Employr",
      url: "https://employr.id",
    },
    publisher: {
      "@type": "Organization",
      name: "Employr",
      url: "https://employr.id",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/artikel/${article.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Pusat Bantuan",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.label,
        item: `${SITE_URL}/kategori/${category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/artikel/${article.slug}`,
      },
    ],
  };

  return (
    <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
        {/* MAIN ARTICLE */}
        <article className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-cobalt-600 dark:hover:text-blue-300 transition">
              Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/kategori/${category.slug}`} className="hover:text-cobalt-600 dark:hover:text-blue-300 transition">
              {category.label}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 dark:text-slate-300 truncate">{article.title}</span>
          </nav>

          {/* Title */}
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Link
                href={`/kategori/${category.slug}`}
                className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-100 dark:border-navy-800 flex items-center gap-1 hover:bg-navy-100 transition"
              >
                <FolderOpen className="w-3 h-3" />
                {category.label}
              </Link>
              <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Diperbarui {article.updatedAt}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {article.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              {article.description}
            </p>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>

          {/* Related Articles in Cutout Style */}
          {related.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Panduan Terkait di {category.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.slice(0, 2).map((rel) => (
                  <ArticleCard key={rel.slug} article={rel} />
                ))}
              </div>
            </div>
          )}
        </article>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-5 lg:sticky lg:top-20">
          {/* Related in category */}
          {/* Related in category */}
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs p-5">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <FolderOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              Lainnya di {category.label}
            </h2>
            {related.length > 0 ? (
              <ul className="space-y-1">
                {related.map((rel) => (
                  <li key={rel.slug}>
                    <Link
                      href={`/artikel/${rel.slug}`}
                      className="block p-2.5 rounded-[8px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-cobalt-600 dark:hover:text-blue-300 transition leading-snug"
                    >
                      {rel.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Belum ada artikel lain di kategori ini.</p>
            )}
          </div>

          {/* Help CTA */}
          <div className="rounded-[10px] bg-navy-800 text-white p-5 border border-navy-700 shadow-sm">
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold">Perlu panduan topik lain?</h2>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Telusuri seluruh artikel bantuan atau tanyakan langsung melalui widget Herdi di pojok kanan bawah.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <OpenChatButton
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition border-0 cursor-pointer"
                >
                  <MessageSquareText className="w-3.5 h-3.5" />
                  Tanya Herdi
                </OpenChatButton>
                <Link
                  href="/cari"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  Cari Artikel
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Back to top */}
      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-cobalt-600 dark:hover:text-blue-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke beranda Pusat Bantuan
        </Link>
      </div>
    </div>
  );
}
