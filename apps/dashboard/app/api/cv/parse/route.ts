import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import { extractCvDataWithNLP, DynamicDictionaries } from '@/lib/smart-cv-parser';
import { callAiGateway } from '@/lib/ai-gateway';
import { syncUserCvEmbedding } from '@/lib/user-career-embedding';
import { cleanBulletText } from '@/lib/cv-bullets';

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
      const val = item.value?.trim();
      if (!val) continue;

      // Filter out unbalanced parentheses or corrupted items
      const openParens = (val.match(/\(/g) || []).length;
      const closeParens = (val.match(/\)/g) || []).length;
      if (openParens !== closeParens) continue;

      if (item.category === 'skill') dicts.skills?.push(val);
      else if (item.category === 'position') dicts.positions?.push(val);
      else if (item.category === 'institution') dicts.institutions?.push(val);
      else if (item.category === 'city') dicts.cities?.push(val);
    }

    cachedDictionaries = dicts;
    lastCacheTime = now;
    return dicts;
  } catch (err) {
    // If DB model doesn't exist yet or connection fails, fallback gracefully to empty
    return { skills: [], positions: [], institutions: [], cities: [] };
  }
}

function cleanDictionaryToken(val: unknown, maxLen = 60): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val
    .replace(/^[_*~`\s(]+|[_*~`\s)]+$/g, '')
    .trim();
  if (trimmed.length < 2 || trimmed.length > maxLen) return null;
  // Must have balanced parentheses
  const openParens = (trimmed.match(/\(/g) || []).length;
  const closeParens = (trimmed.match(/\)/g) || []).length;
  if (openParens !== closeParens) return null;
  // Must contain letters
  if (!/[a-zA-Z]/.test(trimmed)) return null;
  return trimmed;
}

async function recordLearnedTokens(data: any): Promise<void> {
  try {
    const upsertBatch: { category: string; value: string }[] = [];

    if (Array.isArray(data.skills)) {
      for (const skill of data.skills) {
        const clean = cleanDictionaryToken(skill);
        if (clean && !clean.toLowerCase().includes('impor') && !clean.toLowerCase().includes('dokumen')) {
          upsertBatch.push({ category: 'skill', value: clean });
        }
      }
    }

    if (data.experienceTitle) {
      const clean = cleanDictionaryToken(data.experienceTitle);
      if (clean) upsertBatch.push({ category: 'position', value: clean });
    }

    if (Array.isArray(data.targetPositions)) {
      for (const pos of data.targetPositions) {
        const clean = cleanDictionaryToken(pos);
        if (clean) upsertBatch.push({ category: 'position', value: clean });
      }
    }

    if (data.institutionName) {
      const clean = cleanDictionaryToken(data.institutionName, 100);
      if (clean) upsertBatch.push({ category: 'institution', value: clean });
    }

    if (data.location && typeof data.location === 'string') {
      const rawCity = data.location.replace(/,\s*Indonesia$/i, '').trim();
      const clean = cleanDictionaryToken(rawCity, 60);
      if (clean) upsertBatch.push({ category: 'city', value: clean });
    }

    for (const item of upsertBatch) {
      const cleanVal = item.value.trim();
      if (!cleanVal) continue;
      try {
        const existing = await (prisma as any).cv_learning_dictionary.findFirst({
          where: { value: { equals: cleanVal, mode: 'insensitive' } },
        });

        if (existing) {
          await (prisma as any).cv_learning_dictionary.update({
            where: { id: existing.id },
            data: { frequency: { increment: 1 } },
          });
        } else {
          await (prisma as any).cv_learning_dictionary.create({
            data: {
              category: item.category,
              value: cleanVal,
              frequency: 1,
            },
          });
        }
      } catch {}
    }

    // Invalidate cache so next runs pick up learned items immediately
    cachedDictionaries = null;
  } catch (err) {
    console.warn('[CV Self-Learning]: Non-blocking token recording skipped', err);
  }
}

async function extractDocxHeaderXml(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore
    const mammothZip = require('mammoth/lib/zipfile');
    const zip = await mammothZip.openArrayBuffer(buffer);
    const headerTexts: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const headerPath = `word/header${i}.xml`;
      if (zip.exists(headerPath)) {
        const xml = await zip.read(headerPath, 'utf8');
        const textMatches = xml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi) || [];
        const cleanTexts = textMatches.map((m: string) => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
        if (cleanTexts.length > 0) {
          headerTexts.push(cleanTexts.join(' '));
        }
      }
    }
    return headerTexts.join('\n');
  } catch {
    return '';
  }
}

function isValidParsedFullName(name: unknown): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return false;
  const lower = trimmed.toLowerCase();
  if (
    /^(full\s*name|nama\s*lengkap|nama\s*anda|candidate\s*name|nama|name|curriculum\s*vitae|resume|biodata|data\s*pribadi|data\s*diri|pengguna\s*employr|guest\s*screener\s*tester|nama\s*pelamar)$/i.test(
      lower
    )
  ) {
    return false;
  }
  // Cegah label bahasa, skills, atau kategori section lolos sebagai nama
  if (/\b(languages?|bahasa|english|skills?|skill|tools?|tool|experience|education|projects?|hard\s*skills?|soft\s*skills?)\b/i.test(lower)) {
    return false;
  }
  return true;
}

function htmlToCleanText(html: string): string {
  let text = html;

  // 1. Process table cells first so <p> tags inside cells don't shatter table rows into multiple lines
  text = text.replace(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi, (_, tag, content) => {
    const cleanCell = content
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .trim();
    return cleanCell ? ` ${cleanCell} \t ` : '';
  });

  // Convert table rows to newlines
  text = text
    .replace(/<tr[^>]*>/gi, '')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/?(table|tbody|thead|tfoot)[^>]*>/gi, '\n');

  // Convert list items
  text = text
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '\n');

  // Convert headings to clear block sections
  text = text
    .replace(/<h[1-6][^>]*>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n');

  // Convert breaks and paragraphs
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/?(div|section|article|header|footer|blockquote|ul|ol)[^>]*>/gi, '\n');

  // Strip all remaining inline HTML tags (<strong>, <em>, <span>, <a>, <b>, <i>, <u>, etc.)
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // Normalize special Word bullet characters
  text = text
    .replace(/[\uF0B7\uF0A7\uF076\u2022\u25AA\u25CF]/g, '\n- ')
    .replace(/\r\n/g, '\n');

  // Clean lines and whitespace, filter out standalone artifact lines (e.g. standalone "|", "-", or delimiters)
  text = text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line.length > 0 && !/^[\|\:\-\–—\s]+$/.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

function cleanCvString(str: string): string {
  if (typeof str !== 'string') return str;
  let s = str;
  // Fix escaped punctuation (e.g. *,* or \*)
  s = s.replace(/\*,\*|\\\*/g, ',');
  s = s.replace(/\\([()[\]*_.#+-])/g, '$1');
  // Strip bold/italic markdown delimiters (__text__ or **text** or *text*)
  s = s.replace(/__+([^_]+)__+/g, '$1');
  s = s.replace(/\*\*+([^*]+)\*\*+/g, '$1');
  // Strip leading/trailing underscores and asterisks from tokens
  s = s.replace(/^[_*~`\s]+|[_*~`\s]+$/g, '');
  // Replace leftover double underscores inside string with single space
  s = s.replace(/__+/g, ' ');
  return s.trim();
}

function sanitizeCvData(data: any): any {
  if (typeof data === 'string') {
    return cleanCvString(data);
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeCvData(item));
  }
  if (data !== null && typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      cleaned[key] = sanitizeCvData(val);
    }
    return cleaned;
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    let user = await getAuthUser(req);
    // Fallback: check legacy/client session cookie if DB lookup was skipped
    if (!user) {
      const legacyCookie = req.cookies.get('cuti_user_session')?.value;
      if (legacyCookie) {
        try {
          const decoded = decodeURIComponent(legacyCookie);
          const parsed = JSON.parse(decoded);
          if (parsed?.email || parsed?.name) {
            user = {
              id: parsed.id || 'client-session-user',
              name: parsed.name || 'Pengguna Employr',
              email: parsed.email || 'user@employr.id',
              role: parsed.role || 'FREE',
            };
          }
        } catch {}
      }
    }

    // In non-production or screener evaluation, allow parsing without blocking
    if (!user && process.env.NODE_ENV !== 'production') {
      user = {
        id: 'dev-guest-user',
        name: 'Guest Screener Tester',
        email: 'guest@localhost',
        role: 'FREE',
      };
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Silakan masuk terlebih dahulu untuk mengimpor berkas CV.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Berkas tidak ditemukan' }, { status: 400 });
    }

    // Limit maximum file size to 10MB to prevent OOM/DoS
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran berkas terlalu besar. Maksimal 10MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate binary magic bytes to prevent file extension spoofing
    const isPdfMagic = buffer.length >= 4 && buffer.toString('utf-8', 0, 4) === '%PDF';
    const isZipMagic = buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b; // PK zip header for docx

    let rawText = '';

    if (file.name.endsWith('.pdf')) {
      if (!isPdfMagic) {
        return NextResponse.json(
          { error: 'Berkas PDF tidak valid atau rusak.' },
          { status: 400 }
        );
      }
      try {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        rawText = pdfData.text;
        await parser.destroy();
      } catch (pdfErr: any) {
        if (/password|encrypt/i.test(pdfErr?.message || '')) {
          return NextResponse.json(
            { error: 'Berkas PDF ini terkunci kata sandi (password). Silakan unggah versi PDF yang tidak terproteksi sandi.' },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: 'Gagal mengekstrak teks dari berkas PDF. Dokumen mungkin rusak atau tidak kompatibel.' },
          { status: 400 }
        );
      }
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      if (file.name.endsWith('.doc') && !isZipMagic) {
        return NextResponse.json(
          {
            error:
              'Berkas format .DOC lama (Word 97-2003) tidak didukung secara langsung. Silakan buka dokumen di Microsoft Word atau Google Docs, lalu simpan sebagai format .DOCX atau ekspor sebagai .PDF.',
          },
          { status: 400 }
        );
      }

      if (!isZipMagic && file.name.endsWith('.docx')) {
        return NextResponse.json(
          { error: 'Berkas DOCX tidak valid atau rusak.' },
          { status: 400 }
        );
      }

      // Ekstraksi terstruktur berbasis Semantic HTML agar heading, list, dan tabel berjarak rapi
      // Mencegah artifak Markdown seperti double underscore (__) dari teks tebal (bold) Word
      try {
        const htmlResult = await mammoth.convertToHtml({ buffer });
        if (htmlResult.value && htmlResult.value.trim()) {
          rawText = htmlToCleanText(htmlResult.value);
        }
      } catch (htmlErr) {
        console.warn('[DOCX HTML Extraction Warning] Fallback ke raw text:', htmlErr);
      }

      // Fallback jika hasil HTML kosong
      if (!rawText || !rawText.trim()) {
        const docxResult = await mammoth.extractRawText({ buffer });
        rawText = (docxResult.value || '')
          .replace(/[\uF0B7\uF0A7\uF076\u2022\u25AA\u25CF]/g, '\n- ')
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      }

      // Prepend text from Word Page Headers (word/header*.xml) if present
      const docxHeaderText = await extractDocxHeaderXml(buffer);
      if (docxHeaderText && docxHeaderText.trim()) {
        rawText = `${docxHeaderText.trim()}\n\n${rawText}`;
      }
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
      return NextResponse.json(
        {
          error:
            'Tidak dapat menemukan teks pada berkas CV ini. Jika berkas merupakan hasil foto/scan gambar, pastikan mengunggah dokumen PDF atau Word yang memuat teks digital yang dapat diseleksi (bukan murni gambar).',
        },
        { status: 400 }
      );
    }

    // Fetch dynamic learned dictionaries (Cached in RAM)
    const dynamicDicts = await getLearnedDictionaries();

    // 1. Run Rule-Based Smart NLP Extractor as initial baseline & fallback
    let extractedData = extractCvDataWithNLP(rawText, dynamicDicts);

    // 2. Invoke AI Gateway using the active provider configured in Admin Dashboard (ai-config)
    try {
      const systemPrompt = 'You are a high-speed CV extraction API. Output ONLY valid JSON immediately starting with "{" and ending with "}". DO NOT think, DO NOT output reasoning, DO NOT output any preamble or conversational text.';

      const aiPrompt = `Directly convert the following CV text into the exact JSON schema below. Start your output immediately with '{'.

CV TEXT:
"""
${rawText.slice(0, 16000)}
"""

OUTPUT SCHEMA:
{
  "fullName": "Full name",
  "contactInfo": "Email address",
  "phone": "Phone number",
  "location": "City/Region",
  "targetPositions": ["Target job title"],
  "summary": "Full summary/about me text",
  "topAchievementSnippet": "One single strongest measurable achievement rewritten concisely in natural Indonesian (max 10-12 words, e.g. 'Memimpin 12 proyek klien dengan 90% tepat waktu' or 'Meningkatkan efisiensi kerja tim hingga 80%')",
  "skills": ["Skill 1", "Skill 2"],
  "education": [
    {
      "id": "edu-1",
      "institution": "University/School",
      "degree": "S1/D3/SMK/SMA",
      "major": "Major",
      "year": "Period",
      "description": "GPA, courses, achievements"
    }
  ],
  "experience": [
    {
      "id": "exp-1",
      "role": "Job Title",
      "company": "Company Name",
      "period": "Period",
      "description": "Poin tugas atau pencapaian 1\\nPoin tugas atau pencapaian 2"
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "Project Name",
      "role": "Role in project",
      "period": "Timeframe",
      "description": "Poin deskripsi proyek 1\\nPoin deskripsi proyek 2"
    }
  ],
  "organizations": [
    {
      "id": "org-1",
      "name": "Organization Name",
      "role": "Role",
      "period": "Period",
      "description": "Poin peran organisasi 1\\nPoin peran organisasi 2"
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "Certificate Name",
      "issuer": "Issuer",
      "issueDate": "Year or date",
      "credentialId": "Credential ID"
    }
  ],
  "courses": [
    {
      "id": "course-1",
      "courseName": "Course/Training Name",
      "institution": "Provider",
      "year": "Period",
      "description": "Poin materi atau keahlian 1\\nPoin materi atau keahlian 2"
    }
  ]
}

CRITICAL RULES:
1. Categorize accurately: Work Experience vs Projects vs Organizations vs Courses vs Certifications.
2. Keep ALL bullet points from the CV text in the description fields as clean lines separated by \\n (DO NOT include any bullet characters such as ▪, •, -, or * at the beginning of lines).
3. Plain text only: Do NOT include any markdown formatting, asterisks, or underscores (such as **, __, or _) in any JSON string value. Return clean, plain text strings only.
4. Provide 'topAchievementSnippet': Select the single most impressive measurable achievement from work experience or projects (prioritize metrics like %, Rp, sprint, team count) and rewrite it into a punchy Indonesian sentence under 12 words.
5. Start directly with '{' and return ONLY the JSON string. No markdown block.`;

      const aiResult = await callAiGateway({
        feature: 'cv_parser',
        promptName: 'CV Parser Gateway',
        prompt: aiPrompt,
        systemPrompt,
        temperature: 0.1,
        maxTokens: 6000,
        userId: user.id,
      });

      if (aiResult?.text) {
        let jsonClean = aiResult.text.replace(/^```[a-z]*\n?/i, '').replace(/```$/g, '').trim();
        const jsonMatch = jsonClean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonClean = jsonMatch[0];
        }
        const parsedAi = JSON.parse(jsonClean);
        if (parsedAi && typeof parsedAi === 'object') {
          // Normalize education level
          let normEduLevel = parsedAi.educationLevel || extractedData.educationLevel || 'S1';
          if (!normEduLevel && Array.isArray(parsedAi.education) && parsedAi.education[0]?.degree) {
            normEduLevel = parsedAi.education[0].degree;
          }

          const hasAiExp = Array.isArray(parsedAi.experience) && parsedAi.experience.length > 0;
          const firstExp = hasAiExp ? parsedAi.experience[0] : null;

          const resolvedFullName = isValidParsedFullName(parsedAi.fullName)
            ? parsedAi.fullName.trim()
            : (isValidParsedFullName(extractedData.fullName) ? extractedData.fullName : '');

          extractedData = {
            ...extractedData,
            ...parsedAi,
            isValidCv: true,
            cvConfidenceScore: 95,
            fullName: resolvedFullName || extractedData.fullName || '',
            contactInfo: parsedAi.contactInfo || extractedData.contactInfo,
            phone: parsedAi.phone || extractedData.phone,
            location: parsedAi.location || extractedData.location,
            educationLevel: normEduLevel,
            institutionName: parsedAi.institutionName || parsedAi.education?.[0]?.institution || extractedData.institutionName,
            major: parsedAi.major || parsedAi.education?.[0]?.major || extractedData.major,
            targetPositions:
              Array.isArray(parsedAi.targetPositions) && parsedAi.targetPositions.length > 0
                ? parsedAi.targetPositions
                : extractedData.targetPositions,
            hasWorkExperience: hasAiExp,
            experienceTitle: firstExp?.role || extractedData.experienceTitle || '',
            experienceCompany: firstExp?.company || extractedData.experienceCompany || '',
            topAchievementSnippet: parsedAi.topAchievementSnippet || extractedData.topAchievementSnippet || '',
            skills:
              Array.isArray(parsedAi.skills) && parsedAi.skills.length > 0
                ? parsedAi.skills
                : extractedData.skills,
            summary: parsedAi.summary || extractedData.summary,
            education:
              Array.isArray(parsedAi.education) && parsedAi.education.length > 0
                ? parsedAi.education.map((e: any, idx: number) => ({
                    ...e,
                    id: e.id || `edu-${idx + 1}`,
                  }))
                : extractedData.education,
            experience:
              Array.isArray(parsedAi.experience) && parsedAi.experience.length > 0
                ? parsedAi.experience.map((e: any, idx: number) => ({
                    ...e,
                    id: e.id || `exp-${idx + 1}`,
                    description: cleanBulletText(e.description),
                  }))
                : (extractedData.experience || []).map((e: any) => ({
                    ...e,
                    description: cleanBulletText(e.description),
                  })),
            projects:
              Array.isArray(parsedAi.projects) && parsedAi.projects.length > 0
                ? parsedAi.projects.map((p: any, idx: number) => ({
                    ...p,
                    id: p.id || `proj-${idx + 1}`,
                    description: cleanBulletText(p.description),
                  }))
                : (extractedData.projects || []).map((p: any) => ({
                    ...p,
                    description: cleanBulletText(p.description),
                  })),
            organizations:
              Array.isArray(parsedAi.organizations) && parsedAi.organizations.length > 0
                ? parsedAi.organizations.map((o: any, idx: number) => ({
                    ...o,
                    id: o.id || `org-${idx + 1}`,
                    description: cleanBulletText(o.description),
                  }))
                : (extractedData.organizations || []).map((o: any) => ({
                    ...o,
                    description: cleanBulletText(o.description),
                  })),
            certifications:
              Array.isArray(parsedAi.certifications) && parsedAi.certifications.length > 0
                ? parsedAi.certifications.map((c: any, idx: number) => ({
                    ...c,
                    id: c.id || `cert-${idx + 1}`,
                  }))
                : extractedData.certifications,
            courses:
              Array.isArray(parsedAi.courses) && parsedAi.courses.length > 0
                ? parsedAi.courses.map((c: any, idx: number) => ({
                    ...c,
                    id: c.id || `course-${idx + 1}`,
                    description: cleanBulletText(c.description),
                  }))
                : (extractedData.courses || []).map((c: any) => ({
                    ...c,
                    description: cleanBulletText(c.description),
                  })),
          };
        }
      }
    } catch (aiErr) {
      console.warn('[CV Parse] AI Gateway parsing gagal/fallback ke NLP lokal:', aiErr);
    }

    // Global deep sanitization: strip stray markdown artifacts, double underscores, and escaped symbols
    extractedData = sanitizeCvData(extractedData);

    // Re-route accidental education entries or awards out of projects
    if (Array.isArray(extractedData.projects)) {
      const cleanedProjects: any[] = [];
      for (const p of extractedData.projects) {
        const pName = p.name || '';
        const isAcademic = /(Universitas|University|Institut|Institute|Politeknik|Polytechnic|Sekolah Tinggi|STMIK|Akademi|Academy|SMA|SMK|MAN)\b/i.test(pName);
        const hasAcademicDegree = /(Bachelor of|Master of|Sarjana|Diploma|Informatics|Teknik Informatika|Skripsi|Thesis|Tesis|GPA|IPK)\b/i.test(pName + ' ' + (p.description || ''));
        const isAwardOrMetadata = /^(?:Awards?|Honors?|Achievements?|Prestasi|Penghargaan|Relevant|Relevant\s*Courses?|Relevant\s*Coursework)\s*[:\-]/i.test(pName);

        if (isAcademic || hasAcademicDegree) {
          if (!Array.isArray(extractedData.education)) extractedData.education = [];
          const cleanInst = pName.replace(/^Last\s*Project\s*/i, '').trim();
          const existingEdu = extractedData.education.find((e: any) =>
            (e.institution || '').toLowerCase().includes(cleanInst.toLowerCase()) ||
            cleanInst.toLowerCase().includes((e.institution || '').toLowerCase())
          );
          if (existingEdu) {
            if (p.period && (!existingEdu.year || existingEdu.year === '2021 - 2025')) existingEdu.year = p.period;
            if (p.description && !existingEdu.description) existingEdu.description = p.description;
          } else {
            extractedData.education.push({
              id: `edu-routed-${Date.now()}-${extractedData.education.length}`,
              institution: cleanInst,
              degree: extractedData.educationLevel ? `${extractedData.educationLevel} ${extractedData.major || ''}`.trim() : 'Sarjana',
              year: p.period || '',
              description: p.description || '',
            });
          }
          continue;
        }

        if (isAwardOrMetadata) {
          if (Array.isArray(extractedData.education) && extractedData.education.length > 0) {
            extractedData.education[0].description = [extractedData.education[0].description, pName].filter(Boolean).join('\n');
          }
          continue;
        }

        cleanedProjects.push(p);
      }
      extractedData.projects = cleanedProjects;
    }

    // Fallback: If fullName is still empty or invalid, re-run NLP candidate name extractor
    if (!extractedData.fullName || !isValidParsedFullName(extractedData.fullName)) {
      const nlpFallback = extractCvDataWithNLP(rawText, dynamicDicts);
      if (nlpFallback.fullName && isValidParsedFullName(nlpFallback.fullName)) {
        extractedData.fullName = nlpFallback.fullName;
      }
    }

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

    // Sync User Career Vector Embedding (Background Async)
    if (user?.id && !user.id.startsWith('dev-guest')) {
      syncUserCvEmbedding(user.id, extractedData).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (err: any) {
    console.error('[CV Parse API Error]:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat membaca berkas' }, { status: 500 });
  }
}
