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

const ADMIN_GATEWAY_URL = process.env.ADMIN_GATEWAY_URL || "http://localhost:3002";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, systemInstruction, model } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt tidak boleh kosong" }, { status: 400 });
    }

    // Attempt 1: Route through Admin AI Gateway (Port 3002 /api/test-ai)
    try {
      const adminRes = await fetch(`${ADMIN_GATEWAY_URL}/api/test-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "completion",
          prompt: `${systemInstruction ? `[SYSTEM]: ${systemInstruction}\n\n` : ""}${prompt}`,
          model: model || "gpt-4o-mini",
        }),
      });

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        if (adminData.ok && adminData.content) {
          return NextResponse.json({ text: adminData.content, gateway: "admin_port_3002" });
        }
      }
    } catch {
      // Admin Gateway unreachable on port 3002, fallback to primary model
    }

    // Fallback: Direct SDK call
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
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
