import Link from "next/link";
import {
  LifeBuoy,
  BookOpen,
  ChevronRight,
  MessageSquareText,
  Search,
} from "lucide-react";
import { FAQ_CATEGORIES, loadArticles } from "@employr/faq";
import { SearchBox } from "@/components/SearchBox";
import { ArticleCard } from "@/components/ArticleCard";
import { OpenChatButton } from "@/components/OpenChatButton";
import { CutoutCorner } from "@/components/CutoutCard";

export default function HomePage() {
  const articles = loadArticles();
  const latest = [...articles].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 8);

  return (
    <div className="space-y-12 pb-8 w-full">
      {/* HERO */}
      <section className="bg-navy-700 text-white border-b border-navy-800 w-full">
        <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Main Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/10 text-blue-100 border border-white/20 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <span>Dokumentasi Resmi Employr</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                  Pusat Panduan & Bantuan
                  <span className="block text-blue-200 text-xl sm:text-2xl lg:text-3xl font-bold mt-2">
                    Semua petunjuk teknis di satu tempat.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal">
                  Panduan langkah demi langkah pembuatan CV ATS, pemantauan status lamaran di tracker, simulasi screening berkas, dan persiapan interview kerja.
                </p>
              </div>

              {/* Search Box */}
              <div className="max-w-2xl pt-1">
                <SearchBox size="lg" />
              </div>

              {/* Quick Topic Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider mr-1">
                  Topik utama:
                </span>
                {[
                  ["Cetak CV PDF", "/artikel/cara-cetak-cv-pdf"],
                  ["Tracker Lamaran", "/artikel/tracker-lamaran"],
                  ["Evaluasi CV", "/artikel/evaluasi-cv-screener"],
                  ["Misi & Cuan", "/artikel/misi-cuan"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    prefetch={true}
                    className="inline-flex items-center min-h-[36px] px-3.5 py-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 border border-white/25 hover:border-white/40 text-white font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 cursor-pointer"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Information Card (Desktop) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col justify-center">
              <div className="rounded-[10px] bg-white/5 border border-white/15 p-6 backdrop-blur-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-orange-400">
                  <LifeBuoy className="w-4 h-4" aria-hidden="true" />
                  <span>Jaminan Akses Bantuan</span>
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-blue-100/90">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" aria-hidden="true" />
                    <span><strong>100% Terbuka:</strong> Seluruh panduan dan tips dapat diakses langsung tanpa syarat login.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" aria-hidden="true" />
                    <span><strong>Standar HRD:</strong> Disusun sesuai kaidah format ATS dan standar rekrutmen terkini.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" aria-hidden="true" />
                    <span><strong>Tersinkronisasi:</strong> Mengikuti perkembangan fitur dan pembaruan sistem Employr.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Kategori Panduan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {articles.length} artikel dalam {FAQ_CATEGORIES.length} kelompok topik
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5">
          {FAQ_CATEGORIES.map((cat) => {
            const count = articles.filter((a) => a.category === cat.slug).length;
            const categoryMeta: Record<string, { gradient: string; icon: typeof BookOpen }> = {
              "cv-dokumen": { gradient: "from-navy-800 via-navy-700 to-cobalt-800", icon: BookOpen },
              "evaluasi-optimasi": { gradient: "from-indigo-950 via-cobalt-800 to-navy-900", icon: BookOpen },
              "lamaran-kerja": { gradient: "from-navy-900 via-blue-800 to-navy-800", icon: BookOpen },
              "misi-reward": { gradient: "from-teal-950 via-emerald-800 to-navy-900", icon: BookOpen },
              "pengembangan-karier": { gradient: "from-navy-950 via-indigo-900 to-cobalt-800", icon: BookOpen },
              "akun-bantuan": { gradient: "from-slate-950 via-navy-900 to-navy-950", icon: BookOpen },
              memulai: { gradient: "from-navy-800 via-cobalt-600 to-navy-950", icon: BookOpen },
            };
            const meta = categoryMeta[cat.slug] || { gradient: "from-navy-800 via-cobalt-600 to-navy-950", icon: BookOpen };
            const CatIcon = meta.icon;

            return (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                prefetch={true}
                className="group/cutout relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-xl hover:border-cobalt-400 dark:hover:border-cobalt-600 transition-all duration-300"
              >
                {/* Cutout Media Banner */}
                <div className={`relative h-20 w-full overflow-hidden bg-gradient-to-br ${meta.gradient} p-3.5 transition-transform duration-500 group-hover/cutout:brightness-105`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
                  <div className="absolute -right-1 -bottom-1 opacity-15 dark:opacity-20 text-white pointer-events-none transition-transform duration-500 group-hover/cutout:scale-110">
                    <CatIcon className="w-16 h-16" />
                  </div>

                  {/* Cutout Pin (Article Count) */}
                  <div className="absolute top-0 right-0 bg-white/20 dark:bg-white/15 backdrop-blur-md text-white rounded-bl-[14px] px-2.5 py-0.5 text-[10px] font-extrabold border-b border-l border-white/20 select-none shadow-xs">
                    <span>{count} artikel</span>
                    <CutoutCorner className="text-white/20 dark:text-white/15 absolute top-0 -left-[19px] -rotate-90" size={20} />
                    <CutoutCorner className="text-white/20 dark:text-white/15 absolute right-0 -bottom-[19px] -rotate-90" size={20} />
                  </div>

                  {/* Cutout Inset Label (Category Icon) */}
                  <div className="absolute bottom-0 left-0 bg-white dark:bg-slate-900 rounded-tr-[14px] px-2.5 py-1.5 flex items-center gap-1.5 shadow-xs select-none">
                    <div className="w-6 h-6 rounded-[6px] bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-blue-300 flex items-center justify-center">
                      <CatIcon className="w-3.5 h-3.5" />
                    </div>
                    <CutoutCorner className="text-white dark:text-slate-900 absolute -right-[19px] -bottom-px rotate-90" size={20} />
                    <CutoutCorner className="text-white dark:text-slate-900 absolute -top-[19px] -left-px rotate-90" size={20} />
                  </div>
                </div>

                <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover/cutout:text-cobalt-600 dark:group-hover/cutout:text-blue-300 transition">
                      {cat.label}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-cobalt-600 dark:text-blue-300 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span>Lihat topik</span>
                    <ChevronRight className="w-3 h-3 group-hover/cutout:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
          {/* 8th Card: Telusuri Seluruh Panduan */}
          <Link
            href="/cari"
            prefetch={true}
            className="group/cutout relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-dashed border-cobalt-300 dark:border-cobalt-800/80 bg-navy-50/40 dark:bg-slate-900/60 shadow-xs hover:shadow-xl hover:border-cobalt-500 transition-all duration-300"
          >
            {/* Cutout Media Banner */}
            <div className="relative h-20 w-full overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-cobalt-900 p-3.5 transition-transform duration-500 group-hover/cutout:brightness-105">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
              <div className="absolute -right-1 -bottom-1 opacity-15 dark:opacity-20 text-white pointer-events-none transition-transform duration-500 group-hover/cutout:scale-110">
                <Search className="w-16 h-16" />
              </div>

              {/* Cutout Pin */}
              <div className="absolute top-0 right-0 bg-white/20 dark:bg-white/15 backdrop-blur-md text-white rounded-bl-[14px] px-2.5 py-0.5 text-[10px] font-extrabold border-b border-l border-white/20 select-none shadow-xs">
                <span>{articles.length} panduan</span>
                <CutoutCorner className="text-white/20 dark:text-white/15 absolute top-0 -left-[19px] -rotate-90" size={20} />
                <CutoutCorner className="text-white/20 dark:text-white/15 absolute right-0 -bottom-[19px] -rotate-90" size={20} />
              </div>

              {/* Cutout Inset Label */}
              <div className="absolute bottom-0 left-0 bg-white dark:bg-slate-900 rounded-tr-[14px] px-2.5 py-1.5 flex items-center gap-1.5 shadow-xs select-none">
                <div className="w-6 h-6 rounded-[6px] bg-navy-700 text-white flex items-center justify-center">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <CutoutCorner className="text-white dark:text-slate-900 absolute -right-[19px] -bottom-px rotate-90" size={20} />
                <CutoutCorner className="text-white dark:text-slate-900 absolute -top-[19px] -left-px rotate-90" size={20} />
              </div>
            </div>

            <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover/cutout:text-cobalt-600 dark:group-hover/cutout:text-blue-300 transition">
                  Semua Panduan
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  Telusuri indeks lengkap topik, alur fitur, dan panduan teknis Employr.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-cobalt-600 dark:text-blue-300 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Buka pencarian lengkap</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/cutout:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ARTIKEL TERBARU */}
      <section className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Panduan Baru Diperbarui
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pembaruan alur fitur dan petunjuk penggunaan terbaru
            </p>
          </div>
          <Link
            href="/cari"
            className="flex items-center gap-1.5 text-xs font-bold text-cobalt-600 dark:text-blue-300 hover:underline"
          >
            <Search className="w-3.5 h-3.5" />
            Cari artikel lain
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5">
          {latest.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {/* CTA TANYA HERDI */}
      <section className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="rounded-[10px] bg-navy-800 text-white p-6 md:p-8 lg:p-10 border border-navy-700 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Bantuan Pengguna</span>
              </div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                Herdi siap menjawab pertanyaanmu
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tanya langsung lewat widget Herdi di sudut kanan bawah untuk panduan fitur, status akun, atau kendala teknis.
              </p>
            </div>
            <OpenChatButton
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition border-0 cursor-pointer"
            >
              <MessageSquareText className="w-4 h-4" />
              Tanya Herdi Sekarang
            </OpenChatButton>
          </div>
        </div>
      </section>
    </div>
  );
}
