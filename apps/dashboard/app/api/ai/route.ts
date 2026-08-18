import { NextRequest, NextResponse } from "next/server";

// Custom LLM OpenAI-compatible configuration
// AI_ENDPOINT: base URL, contoh "https://api.openai.com/v1" (tanpa trailing slash)
// AI_API_KEY:  API key provider (format Bearer / OpenAI style)
// AI_MODEL:    nama model default
const AI_ENDPOINT = (process.env.AI_ENDPOINT || "https://api.openai.com/v1").replace(/\/+$/, "");
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, systemInstruction, model } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt tidak boleh kosong" }, { status: 400 });
    }

    if (!AI_API_KEY) {
      return NextResponse.json(
        { error: "AI_API_KEY belum dikonfigurasi di server. Set AI_ENDPOINT & AI_API_KEY di .env dashboard." },
        { status: 500 }
      );
    }

    const url = `${AI_ENDPOINT}/chat/completions`;
    const payload = {
      model: model || AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            systemInstruction ||
            "Anda adalah Asisten Karir AI terkemuka di Indonesia. Berikan saran karir, draf dokumen, atau analisis yang sangat spesifik, terstruktur, profesional, dan relevan.",
        },
        { role: "user", content: prompt },
      ],
      stream: false,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
        "api-key": AI_API_KEY, // Azure OpenAI compatibility
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { rawText };
    }

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status} ${res.statusText}`;
      if (res.status === 401) {
        errorMsg = "API Key tidak valid (401 Unauthorized). Periksa kembali AI_API_KEY.";
      } else if (res.status === 404) {
        errorMsg = `Model '${payload.model}' atau endpoint '${url}' tidak ditemukan (404).`;
      } else if (data.error?.message) {
        errorMsg = data.error.message;
      }
      console.error("AI Route Error:", errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: res.status });
    }

    const text =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      data.text ||
      "";

    if (!text) {
      return NextResponse.json({ error: "Tidak ada teks jawaban yang dikembalikan dari AI." }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server AI";
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
