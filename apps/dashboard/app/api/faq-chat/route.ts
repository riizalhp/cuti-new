import { NextRequest, NextResponse } from "next/server";
import { searchFaq, getQuickPrompts } from "@employr/faq";

/**
 * Chat Customer Service (Herdi) — berbasis retrieval, BUKAN AI generatif.
 *
 * Mesin: TF-IDF + cosine similarity atas artikel Pusat Bantuan
 * (paket @employr/faq, sumber konten: packages/faq/content).
 * Cepat, gratis, deterministik, offline, dan selalu merujuk ke sumber resmi.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        {
          text: "Halo! Lagi butuh info apa di Employr? Ketik aja pertanyaan atau kendala yang kamu alami (misal: cetak CV, tracker lamaran, career intelligence, atau draf email), nanti aku carikan panduan resminya ya.",
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
        text: "Layanan bantuan lagi terganggu nih. Coba kirim ulang pesanmu sebentar lagi, atau kamu bisa buka langsung Pusat Bantuan di faq.employr.id ya.",
        answered: false,
        suggestions: getQuickPrompts(4),
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
