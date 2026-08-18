import Link from "next/link";
import {
  LifeBuoy,
  BookOpen,
  ChevronRight,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { FAQ_CATEGORIES, loadArticles } from "@cuti/faq";
import { SearchBox } from "@/components/SearchBox";
import { ArticleCard } from "@/components/ArticleCard";
import { APP_URL } from "@/lib/site";

export default function HomePage() {
  const articles = loadArticles();
  const latest = [...articles].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 6);

  return (
    <div className="space-y-12 pb-4">
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-700 text-white border-b border-navy-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cobalt-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-navy-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-bold bg-cobalt-500/20 text-orange-300 border border-cobalt-500/30">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Pusat Bantuan & Dokumentasi Resmi</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Ada pertanyaan tentang Employr?
              <span className="block text-blue-200">Semua jawabannya ada di sini.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              Panduan lengkap penggunaan sistem — dari membuat CV ATS, tracker lamaran,
              misi & cuan, hingga pembayaran. Cari, baca, dan langsung praktikkan.
            </p>

            <div className="max-w-xl pt-1">
              <SearchBox size="lg" />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Populer:
              </span>
              {[
                ["Cetak CV PDF", "/artikel/cara-cetak-cv-pdf"],
                ["Tracker Lamaran", "/artikel/tracker-lamaran"],
                ["Pembayaran", "/artikel/cara-pembayaran"],
                ["Misi & Cuan", "/artikel/misi-cuan"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="px-2.5 py-1 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/15 text-blue-100 font-bold transition"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Jelajahi berdasarkan kategori
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {articles.length} artikel panduan dalam {FAQ_CATEGORIES.length} kategori
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FAQ_CATEGORIES.map((cat) => {
            const count = articles.filter((a) => a.category === cat.slug).length;
            return (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                className="group bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-cobalt-300 dark:hover:border-cobalt-800 hover:-translate-y-0.5 transition-all duration-200 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-[10px] bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-100 dark:border-navy-800 flex items-center justify-center group-hover:bg-cobalt-500 group-hover:text-white group-hover:border-cobalt-500 transition">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {count} artikel
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-blue-300 transition">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ARTIKEL TERBARU */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Panduan terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Artikel yang baru diperbarui
            </p>
          </div>
          <Link
            href="/cari"
            className="flex items-center gap-1.5 text-xs font-bold text-cobalt-600 dark:text-blue-300 hover:underline"
          >
            <Search className="w-3.5 h-3.5" />
            Cari semua
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latest.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {/* CTA TANYA HERDI */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-cobalt-500 via-navy-700 to-navy-900 text-white p-6 md:p-10 shadow-xl">
          <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-cobalt-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Masih bingung?</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                Tanya langsung ke Herdi, Customer Service Employr
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                Buka dashboard lalu klik karakter Herdi di pojok kanan bawah. Jawaban diambil
                otomatis dari Pusat Bantuan ini — cepat, konsisten, dan selalu mengarah ke sumbernya.
              </p>
            </div>
            <Link
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-[10px] bg-white text-navy-800 font-extrabold text-xs shadow-lg hover:bg-slate-100 transition border-0"
            >
              <MessageCircle className="w-4 h-4" />
              Buka Dashboard & Tanya Herdi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
