import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { prisma } from '@cuti/db';
import { extractCvDataWithNLP, DynamicDictionaries } from '@/lib/smart-cv-parser';

// In-Memory Cache for Learned Dictionaries (Refreshed every 5 minutes)
let cachedDictionaries: DynamicDictionaries | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getLearnedDictionaries(): Promise<DynamicDictionaries> {
  const now = Date.now();
  if (cachedDictionaries && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedDictionaries;
  }

  try {
    const records = await (prisma as any).cv_learning_dictionary.findMany({
      select: { category: true, value: true },
    });

    const dicts: DynamicDictionaries = {
      skills: [],
      positions: [],
      institutions: [],
      cities: [],
    };

    for (const item of records) {
      if (item.category === 'skill') dicts.skills?.push(item.value);
      else if (item.category === 'position') dicts.positions?.push(item.value);
      else if (item.category === 'institution') dicts.institutions?.push(item.value);
      else if (item.category === 'city') dicts.cities?.push(item.value);
    }

    cachedDictionaries = dicts;
    lastCacheTime = now;
    return dicts;
  } catch (err) {
    // If DB model doesn't exist yet or connection fails, fallback gracefully to empty
    return { skills: [], positions: [], institutions: [], cities: [] };
  }
}

async function recordLearnedTokens(data: any): Promise<void> {
  try {
    const upsertBatch: { category: string; value: string }[] = [];

    if (Array.isArray(data.skills)) {
      for (const skill of data.skills) {
        if (typeof skill === 'string' && skill.trim().length >= 2 && skill.trim().length <= 60 && !skill.toLowerCase().includes('impor') && !skill.toLowerCase().includes('dokumen')) {
          upsertBatch.push({ category: 'skill', value: skill.trim() });
        }
      }
    }

    if (data.experienceTitle && typeof data.experienceTitle === 'string' && data.experienceTitle.trim().length <= 60) {
      upsertBatch.push({ category: 'position', value: data.experienceTitle.trim() });
    }

    if (Array.isArray(data.targetPositions)) {
      for (const pos of data.targetPositions) {
        if (typeof pos === 'string' && pos.trim() && pos.trim().length <= 60) {
          upsertBatch.push({ category: 'position', value: pos.trim() });
        }
      }
    }

    if (data.institutionName && typeof data.institutionName === 'string' && data.institutionName.trim().length <= 100) {
      upsertBatch.push({ category: 'institution', value: data.institutionName.trim() });
    }

    if (data.location && typeof data.location === 'string') {
      const city = data.location.replace(/,\s*Indonesia$/i, '').trim();
      if (city && city.length <= 60) {
        upsertBatch.push({ category: 'city', value: city });
      }
    }

    for (const item of upsertBatch) {
      await (prisma as any).cv_learning_dictionary.upsert({
        where: { value: item.value },
        update: { frequency: { increment: 1 } },
        create: {
          category: item.category,
          value: item.value,
          frequency: 1,
        },
      }).catch(() => {});
    }

    // Invalidate cache so next runs pick up learned items immediately
    cachedDictionaries = null;
  } catch (err) {
    console.warn('[CV Self-Learning]: Non-blocking token recording skipped', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Berkas tidak ditemukan' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let rawText = '';

    if (file.name.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      rawText = pdfData.text;
      await parser.destroy();
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      const docxResult = await mammoth.extractRawText({ buffer });
      rawText = docxResult.value;
    } else if (file.name.endsWith('.txt') || file.name.endsWith('.json')) {
      rawText = buffer.toString('utf-8');
      if (file.name.endsWith('.json')) {
        try {
          const jsonParsed = JSON.parse(rawText);
          return NextResponse.json({
            success: true,
            data: {
              fullName: jsonParsed.fullName || jsonParsed.name || '',
              contactInfo: jsonParsed.email || jsonParsed.contactInfo || '',
              phone: jsonParsed.phone || '',
              location: jsonParsed.location || jsonParsed.city || '',
              educationLevel: jsonParsed.education?.[0]?.degree || 'S1',
              institutionName: jsonParsed.education?.[0]?.institution || '',
              major: jsonParsed.education?.[0]?.major || jsonParsed.major || '',
              targetPositions: jsonParsed.headline ? [jsonParsed.headline] : jsonParsed.targetPositions || [],
              hasWorkExperience: (jsonParsed.experience && jsonParsed.experience.length > 0) ?? true,
              experienceTitle: jsonParsed.experience?.[0]?.role || '',
              experienceCompany: jsonParsed.experience?.[0]?.company || '',
              skills: jsonParsed.skills || jsonParsed.skillsList?.map((s: any) => s.name) || [],
              summary: jsonParsed.summary || '',
            },
          });
        } catch {
          // Fallback to text parsing if JSON parse fails
        }
      }
    } else {
      return NextResponse.json({ error: 'Format berkas tidak didukung (.pdf, .docx, .json, .txt)' }, { status: 400 });
    }

    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ error: 'Gagal mengekstrak teks dari berkas CV.' }, { status: 400 });
    }

    // Fetch dynamic learned dictionaries (Cached in RAM)
    const dynamicDicts = await getLearnedDictionaries();

    // Run Rule-Based Smart NLP Extractor
    const extractedData = extractCvDataWithNLP(rawText, dynamicDicts);

    if (!extractedData.isValidCv) {
      return NextResponse.json(
        {
          success: false,
          isNonCv: true,
          error: extractedData.validationMessage || 'Berkas yang diunggah tampaknya bukan dokumen CV atau Resume. Pastikan berkas memuat informasi pendidikan, pengalaman, atau keahlian kamu.',
          data: extractedData,
        },
        { status: 422 }
      );
    }

    // Auto-Learning & Self-Enrichment (Background Async)
    recordLearnedTokens(extractedData).catch(() => {});

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (err: any) {
    console.error('[CV Parse API Error]:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat membaca berkas' }, { status: 500 });
  }
}
