import Link from "next/link";
import {
  FileText,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Briefcase,
  Award,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { FaqArticle } from "@employr/faq";
import { getCategory } from "@employr/faq";
import { CutoutCorner } from "@/components/CutoutCard";

interface ArticleCardProps {
  article: FaqArticle;
  showCategory?: boolean;
}

const CATEGORY_STYLES: Record<
  string,
  {
    gradient: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }
> = {
  "cv-dokumen": {
    gradient: "from-navy-800 via-navy-700 to-cobalt-800",
    icon: FileText,
    accent: "text-blue-300",
  },
  "evaluasi-optimasi": {
    gradient: "from-indigo-950 via-cobalt-800 to-navy-900",
    icon: CheckCircle2,
    accent: "text-cyan-300",
  },
  "lamaran-kerja": {
    gradient: "from-navy-900 via-blue-800 to-navy-800",
    icon: Briefcase,
    accent: "text-amber-300",
  },
  "misi-reward": {
    gradient: "from-teal-950 via-emerald-800 to-navy-900",
    icon: Award,
    accent: "text-emerald-300",
  },
  "pengembangan-karier": {
    gradient: "from-navy-950 via-indigo-900 to-cobalt-800",
    icon: GraduationCap,
    accent: "text-purple-300",
  },
  "akun-bantuan": {
    gradient: "from-slate-950 via-navy-900 to-navy-950",
    icon: ShieldCheck,
    accent: "text-orange-300",
  },
  memulai: {
    gradient: "from-navy-800 via-cobalt-600 to-navy-950",
    icon: Sparkles,
    accent: "text-lime-300",
  },
};

export function ArticleCard({ article, showCategory = true }: ArticleCardProps) {
  const category = getCategory(article.category);
  const style = CATEGORY_STYLES[article.category] || {
    gradient: "from-navy-800 via-cobalt-600 to-navy-950",
    icon: BookOpen,
    accent: "text-blue-300",
  };
  const Icon = style.icon;

  return (
    <Link
      href={`/artikel/${article.slug}`}
      prefetch={true}
      className="group/cutout relative flex flex-col h-full overflow-hidden rounded-[20px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-xl hover:border-cobalt-400/80 dark:hover:border-cobalt-600 transition-all duration-300"
    >
      {/* Cutout Media Header with Gradient & Corner Insets */}
      <div className={`relative h-28 sm:h-30 w-full overflow-hidden bg-gradient-to-br ${style.gradient} p-4 transition-transform duration-500 group-hover/cutout:brightness-105`}>
        {/* Subtle Decorative Backdrop Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
        <div className="absolute -right-2 -bottom-2 opacity-15 dark:opacity-20 text-white pointer-events-none transition-transform duration-500 group-hover/cutout:scale-110 group-hover/cutout:rotate-6">
          <Icon className="w-24 h-24" />
        </div>

        {/* Top-Right Cutout Pin (Status / Tipe) */}
        <div className="absolute top-0 right-0 bg-white/20 dark:bg-white/15 backdrop-blur-md text-white rounded-bl-[14px] px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase border-b border-l border-white/20 select-none shadow-xs">
          <span>Panduan</span>
          <CutoutCorner className="text-white/20 dark:text-white/15 absolute top-0 -left-[19px] -rotate-90" size={20} />
          <CutoutCorner className="text-white/20 dark:text-white/15 absolute right-0 -bottom-[19px] -rotate-90" size={20} />
        </div>

        {/* Bottom-Left Cutout Inset Label (Category Pill) */}
        <div className="absolute bottom-0 left-0 bg-white dark:bg-slate-900 rounded-tr-[16px] px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs select-none">
          <Icon className={`w-3.5 h-3.5 ${style.accent}`} />
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            {showCategory ? category.label : "Dokumentasi"}
          </span>
          <CutoutCorner className="text-white dark:text-slate-900 absolute -right-[23px] -bottom-px rotate-90" size={24} />
          <CutoutCorner className="text-white dark:text-slate-900 absolute -top-[23px] -left-px rotate-90" size={24} />
        </div>
      </div>

      {/* Cutout Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover/cutout:text-cobalt-600 dark:group-hover/cutout:text-blue-300 transition leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
            {article.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
          <span className="font-medium text-slate-400 dark:text-slate-500">
            {article.updatedAt}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-cobalt-600 dark:text-blue-300 group-hover/cutout:translate-x-0.5 transition-transform">
            <span>Baca panduan</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Floating Hover Action Pill */}
      <div className="absolute right-4 bottom-3 opacity-0 translate-y-2 pointer-events-none group-hover/cutout:opacity-100 group-hover/cutout:translate-y-0 transition-all duration-300 ease-out z-20 hidden sm:block">
        <span className="inline-flex items-center gap-1 bg-cobalt-500 hover:bg-cobalt-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-cobalt-500/25">
          <span>Buka Artikel</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
