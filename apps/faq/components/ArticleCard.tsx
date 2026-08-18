import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import type { FaqArticle } from "@cuti/faq";
import { getCategory } from "@cuti/faq";

interface ArticleCardProps {
  article: FaqArticle;
  showCategory?: boolean;
}

export function ArticleCard({ article, showCategory = true }: ArticleCardProps) {
  const category = getCategory(article.category);

  return (
    <Link
      href={`/artikel/${article.slug}`}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-cobalt-300 dark:hover:border-cobalt-800 transition-all duration-200 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        {showCategory ? (
          <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {category.label}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {article.updatedAt}
          </span>
        )}
        <div className="w-7 h-7 rounded-[10px] bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-100 dark:border-navy-800 flex items-center justify-center shrink-0 group-hover:bg-cobalt-500 group-hover:text-white group-hover:border-cobalt-500 transition">
          <FileText className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-blue-300 transition leading-snug">
        {article.title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2 flex-1">
        {article.description}
      </p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-medium text-slate-400">{article.updatedAt}</span>
        <span className="flex items-center gap-1 text-[11px] font-bold text-cobalt-600 dark:text-blue-300 group-hover:gap-1.5 transition-all">
          Baca
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
