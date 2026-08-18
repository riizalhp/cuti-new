import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { searchFaq } from "@cuti/faq";
import { SearchBox } from "@/components/SearchBox";
import { ArticleCard } from "@/components/ArticleCard";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = {
  title: "Cari di Pusat Bantuan",
  description: "Cari artikel panduan penggunaan Employr.",
  alternates: { canonical: "/cari" },
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  let hits: ReturnType<typeof searchFaq>["hits"] = [];
  let answered = false;
  if (query) {
    const result = searchFaq(query, 12);
    hits = result.hits;
    answered = result.answered;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-cobalt-600 dark:text-blue-300" />
          Cari artikel
        </h1>
        <div className="max-w-xl">
          <SearchBox initialValue={query} size="lg" />
        </div>
      </div>

      {query && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {answered ? (
            <>
              Hasil untuk <strong className="text-slate-900 dark:text-white">"{query}"</strong> —{" "}
              {hits.length} artikel ditemukan
            </>
          ) : (
            <>
              Tidak ada hasil relevan untuk{" "}
              <strong className="text-slate-900 dark:text-white">"{query}"</strong>
            </>
          )}
        </div>
      )}

      {query && hits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hits.map((hit) => (
            <div key={hit.article.slug} className="flex flex-col">
              <ArticleCard article={hit.article} />
              <p className="text-[11px] text-slate-400 mt-1.5 px-1 line-clamp-2">
                {hit.snippet}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <SearchX className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {query ? "Belum ada artikel yang cocok" : "Tulis kata kunci untuk mencari"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {query
                ? "Coba kata kunci lain yang lebih umum, misalnya \"cetak CV\", \"tracker\", \"pembayaran\", atau \"referral\"."
                : "Ketik kata kunci di kotak pencarian di atas, misalnya \"cara cetak CV ke PDF\"."}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white text-xs font-bold shadow-md shadow-cobalt-500/20 transition cursor-pointer border-0"
          >
            Lihat semua kategori
          </Link>
        </div>
      )}
    </div>
  );
}
