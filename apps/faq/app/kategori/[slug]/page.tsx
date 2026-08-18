import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { FAQ_CATEGORIES, getCategory, getArticlesByCategory, loadArticles } from "@cuti/faq";
import { ArticleCard } from "@/components/ArticleCard";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return FAQ_CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  return {
    title: category.label,
    description: category.description,
    alternates: { canonical: `/kategori/${slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!FAQ_CATEGORIES.some((c) => c.slug === slug)) {
    notFound();
  }

  const articles = getArticlesByCategory(slug);
  const allArticles = loadArticles();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb & header */}
      <div className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-cobalt-600 dark:hover:text-blue-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Semua kategori
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] bg-navy-700 text-white flex items-center justify-center shadow-md shadow-navy-700/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {category.label}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Article list */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} showCategory={false} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-10 text-center text-sm text-slate-500">
          Belum ada artikel dalam kategori ini.
        </div>
      )}

      {/* Other categories */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
          Kategori lain
        </h2>
        <div className="flex flex-wrap gap-2">
          {FAQ_CATEGORIES.filter((c) => c.slug !== slug).map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-cobalt-300 dark:hover:border-cobalt-800 hover:text-cobalt-600 dark:hover:text-blue-300 transition"
            >
              {cat.label} ({allArticles.filter((a) => a.category === cat.slug).length})
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
