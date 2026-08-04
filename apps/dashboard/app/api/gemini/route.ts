import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, systemInstruction } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt tidak boleh kosong" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "Anda adalah Asisten Karir AI terkemuka di Indonesia. Berikan saran karir, draf dokumen, atau analisis yang sangat spesifik, terstruktur, profesional, dan relevan.",
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server AI";
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
