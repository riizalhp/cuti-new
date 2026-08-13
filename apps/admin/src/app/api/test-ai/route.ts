import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, endpointUrl, apiKey, model, prompt, temperature, maxTokens } = body

    const cleanEndpoint = (endpointUrl || "https://api.openai.com/v1").replace(/\/+$/, "")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (apiKey && apiKey.trim().length > 0) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`
      headers["api-key"] = apiKey.trim() // Azure OpenAI compatibility
    }

    const startTime = performance.now()

    // Action 1: Test Endpoint / Fetch Models (GET /models)
    if (action === "models" || action === "test_endpoint") {
      const url = `${cleanEndpoint}/models`
      
      let res: Response
      try {
        res = await fetch(url, { method: "GET", headers })
      } catch (err: any) {
        return NextResponse.json({
          ok: false,
          status: 500,
          statusText: "Network Error",
          latencyMs: 0,
          error: `Gagal terhubung ke endpoint URL (${url}). Pastikan URL benar dan server aktif. Detail: ${err.message}`,
          raw: { message: err.message },
        })
      }

      const endTime = performance.now()
      const latencyMs = Math.round(endTime - startTime)

      const rawText = await res.text()
      let responseData: any = {}
      try {
        responseData = JSON.parse(rawText)
      } catch {
        responseData = { rawText }
      }

      if (!res.ok) {
        let errorMsg = `HTTP ${res.status} ${res.statusText}`
        if (res.status === 401) {
          errorMsg = "API Key tidak valid atau tidak diizinkan (401 Unauthorized)."
        } else if (res.status === 404) {
          errorMsg = `Endpoint /models tidak ditemukan pada (${url}).`
        } else if (responseData.error?.message) {
          errorMsg = responseData.error.message
        }

        return NextResponse.json({
          ok: false,
          status: res.status,
          statusText: res.statusText,
          latencyMs,
          error: errorMsg,
          raw: responseData,
        })
      }

      let models: string[] = []
      if (Array.isArray(responseData.data)) {
        models = responseData.data.map((m: any) => m.id || m.name).filter(Boolean)
      } else if (Array.isArray(responseData.models)) {
        models = responseData.models.map((m: any) => m.name || m.id).filter(Boolean)
      }

      return NextResponse.json({
        ok: true,
        status: res.status,
        latencyMs,
        models,
        count: models.length,
        raw: responseData,
      })
    }

    // Action 2: Test Real Completion API (POST /chat/completions)
    if (action === "completion" || action === "test_api") {
      const url = `${cleanEndpoint}/chat/completions`
      const payload = {
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant for AI connection testing." },
          { role: "user", content: prompt || "Halo! Uji koneksi AI real." }
        ],
        temperature: typeof temperature === "number" ? temperature : 0.3,
        max_tokens: typeof maxTokens === "number" ? maxTokens : 512,
        stream: false,
      }

      let res: Response
      try {
        res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        })
      } catch (err: any) {
        return NextResponse.json({
          ok: false,
          status: 500,
          statusText: "Network Error",
          latencyMs: 0,
          error: `Gagal mengirim payload POST ke (${url}). Detail: ${err.message}`,
          raw: { message: err.message },
        })
      }

      const endTime = performance.now()
      const latencyMs = Math.round(endTime - startTime)

      const rawText = await res.text()
      let responseData: any = {}
      try {
        responseData = JSON.parse(rawText)
      } catch {
        responseData = { rawText }
      }

      if (!res.ok) {
        let errorMsg = `HTTP ${res.status} ${res.statusText}`
        if (res.status === 401) {
          errorMsg = "API Key tidak valid atau belum diisi (401 Unauthorized). Silakan periksa kembali API Key Anda."
        } else if (res.status === 404) {
          errorMsg = `Model '${model}' atau rute '${url}' tidak ditemukan (404 Not Found).`
        } else if (res.status === 429) {
          errorMsg = "Batas Kuota / Rate Limit terlampaui (429 Too Many Requests)."
        } else if (responseData.error?.message) {
          errorMsg = responseData.error.message
        }

        return NextResponse.json({
          ok: false,
          status: res.status,
          statusText: res.statusText,
          latencyMs,
          error: errorMsg,
          raw: responseData,
        })
      }

      // Content & Token Parsing (Supports standard JSON and Server-Sent Events SSE Stream)
      let content = ""
      let usage = responseData.usage || null

      if (responseData.choices?.[0]?.message?.content) {
        content = responseData.choices[0].message.content
      } else if (responseData.choices?.[0]?.text) {
        content = responseData.choices[0].text
      } else if (responseData.text) {
        content = responseData.text
      } else if (typeof rawText === "string" && rawText.includes("data: {")) {
        // PARSE SSE STREAM (Server-Sent Events format data: {"choices":[{"delta":{"content":"..."}}]})
        const lines = rawText.split("\n")
        const textChunks: string[] = []
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith("data: ") && !trimmed.endsWith("[DONE]")) {
            try {
              const jsonStr = trimmed.slice(6)
              const chunkObj = JSON.parse(jsonStr)
              if (chunkObj.choices?.[0]?.delta?.content) {
                textChunks.push(chunkObj.choices[0].delta.content)
              } else if (chunkObj.choices?.[0]?.text) {
                textChunks.push(chunkObj.choices[0].text)
              }
              if (chunkObj.usage) {
                usage = chunkObj.usage
              }
            } catch {
              // ignore unparseable line
            }
          }
        }
        if (textChunks.length > 0) {
          content = textChunks.join("")
        }
      }

      if (!content) {
        content = "Tidak ada teks jawaban yang dikembalikan dari AI."
      }

      if (!usage) {
        usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      }

      return NextResponse.json({
        ok: true,
        status: res.status,
        latencyMs,
        content,
        usage,
        raw: responseData.rawText ? responseData : { ...responseData, rawText },
      })
    }

    return NextResponse.json({ ok: false, error: "Action tidak dikenal" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        error: error.message || "Terjadi kesalahan pada server proxy",
      },
      { status: 500 }
    )
  }
}
