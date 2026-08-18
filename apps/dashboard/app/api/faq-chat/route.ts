import { NextRequest, NextResponse } from "next/server";
import { searchFaq, getQuickPrompts } from "@cuti/faq";

/**
 * Chat Customer Service (Herdi) — berbasis retrieval, BUKAN AI generatif.
 *
 * Mesin: TF-IDF + cosine similarity atas artikel Pusat Bantuan
 * (paket @cuti/faq, sumber konten: packages/faq/content).
 * Cepat, gratis, deterministik, offline, dan selalu merujuk ke sumber resmi.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        {
          text: "Halo! Saya Herdi dari Customer Service Employr. Silakan ketik pertanyaanmu, misalnya: cara cetak CV ke PDF, kendala pembayaran, atau panduan misi & referral.",
          suggestions: getQuickPrompts(4),
        },
        { status: 200 }
      );
    }

    const result = searchFaq(query.trim(), 3);

    return NextResponse.json(
      {
        text: result.answerText,
        answered: result.answered,
        title: result.hits[0]?.article.title ?? null,
        slug: result.hits[0]?.article.slug ?? null,
        score: result.hits[0]?.score ?? 0,
        hits: result.hits.map((h) => ({
          title: h.article.title,
          slug: h.article.slug,
          score: h.score,
          snippet: h.snippet,
        })),
        suggestions: result.suggestions,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan pada layanan bantuan";
    console.error("FAQ Chat Route Error:", error);
    return NextResponse.json(
      {
        text: "Maaf, layanan bantuan sedang terganggu. Silakan coba beberapa saat lagi, atau baca Pusat Bantuan di faq.employr.id.",
        answered: false,
        suggestions: getQuickPrompts(4),
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
