import { NextRequest, NextResponse } from "next/server";
import { searchFaq, getQuickPrompts } from "@employr/faq";

/**
 * Chat Customer Service (Herdi) di Pusat Bantuan.
 * Berbasis retrieval kata kunci dan relevansi artikel dokumentasi resmi.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        {
          text: "Halo, saya Herdi dari Customer Service Employr. Ada yang bisa saya bantu terkait pembuatan CV, tracker lamaran, evaluasi berkas, atau kendala akun?",
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
    console.error("FAQ Chat API Error:", error);
    return NextResponse.json(
      {
        text: "Maaf, pencarian jawaban sedang mengalami kendala. Silakan telusuri artikel melalui kolom pencarian di halaman utama.",
        answered: false,
        suggestions: getQuickPrompts(4),
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
