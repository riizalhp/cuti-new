import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, FolderOpen, ChevronRight, ExternalLink } from "lucide-react";
import {
  getArticleBySlug,
  getArticlesByCategory,
  getCategory,
  loadArticles,
  renderMarkdown,
} from "@cuti/faq";
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
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/artikel/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN ARTICLE */}
        <article className="lg:col-span-8">
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
        </article>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          {/* Related in category */}
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs p-5">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <FolderOpen className="w-4 h-4 text-orange-500" />
              Lainnya di {category.label}
            </h2>
            {related.length > 0 ? (
              <ul className="space-y-1">
                {related.map((rel) => (
                  <li key={rel.slug}>
                    <Link
                      href={`/artikel/${rel.slug}`}
                      className="block p-2.5 rounded-[10px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-cobalt-600 dark:hover:text-blue-300 transition leading-snug"
                    >
                      {rel.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Tidak ada artikel lain di kategori ini.</p>
            )}
          </div>

          {/* Help CTA */}
          <div className="relative overflow-hidden rounded-[10px] bg-navy-700 text-white p-5 border border-navy-800 shadow-md">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cobalt-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <h2 className="text-sm font-extrabold">Masih butuh bantuan?</h2>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                Cari artikel lain di Pusat Bantuan, atau tanya langsung ke Herdi di pojok kanan bawah dashboard.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-white text-navy-800 text-xs font-extrabold shadow-md hover:bg-slate-100 transition border-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Lihat semua artikel
              </Link>
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
