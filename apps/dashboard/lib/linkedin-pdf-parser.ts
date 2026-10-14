import { PDFParse } from 'pdf-parse';
import type { ScrapedProfileData } from '@/components/LinkedInAnalysisView';
import { callAiGateway } from '@/lib/ai-gateway';

/**
 * Validasi apakah hasil parsing heuristik lokal memadai dan akurat.
 * Jika format dokumen non-standar (Canva, Word, resume kustom), nama atau section bisa gagal terdeteksi.
 */
function isHeuristicParseSufficient(data: ScrapedProfileData): boolean {
  if (!data.name || data.name.trim().length < 2 || data.name.length > 50) {
    return false;
  }

  const cleanNameNorm = data.name.toLowerCase().replace(/[^a-z]/g, '');
  const invalidNameKeywords = [
    'curriculum',
    'vitae',
    'resume',
    'profil',
    'profile',
    'halaman',
    'page',
    'ringkasan',
    'summary',
    'kontak',
    'contact',
    'biodata',
    'datadiri',
  ];
  if (invalidNameKeywords.some((kw) => cleanNameNorm.includes(kw))) {
    return false;
  }

  // Jika nama mengandung karakter URL, email, atau angka nomor HP
  if (/[@\/\\]|\b(?:https?|www|gmail|yahoo|linkedin)\b/i.test(data.name)) {
    return false;
  }

  const hasExperience = Array.isArray(data.experience) && data.experience.length > 0;
  const hasEducation = Array.isArray(data.education) && data.education.length > 0;
  const hasSkills = Array.isArray(data.skills) && data.skills.length >= 2;

  // Setidaknya harus ada riwayat pengalaman, pendidikan, atau keahlian yang terdeteksi
  if (!hasExperience && !hasSkills && !hasEducation) {
    return false;
  }

  return true;
}

/**
 * Fallback parser berbasis AI jika template dokumen PDF tidak mengikuti layout resmi LinkedIn (misal: Canva, Word).
 */
export async function parseLinkedInPdfWithAi(
  rawText: string,
  userId?: string
): Promise<ScrapedProfileData> {
  const sampleText = rawText.slice(0, 4000);
  const prompt = `Berikut adalah cuplikan teks mentah dari dokumen resume / profil yang diunggah pengguna (mungkin berasal dari PDF LinkedIn, CV Canva, Word, atau template lainnya):
"""
${sampleText}
"""

Tugas: Ekstrak data profil ini menjadi format JSON terstruktur persis dengan skema berikut:
{
  "name": "Nama lengkap pemilik profil/kandidat",
  "headline": "Headline profesional atau posisi/bidang yang relevan",
  "about": "Ringkasan / summary / tentang saya jika ada",
  "location": "Kota / Lokasi kandidat jika ada",
  "connections": "",
  "experience": [
    {
      "role": "Nama jabatan / posisi",
      "company": "Nama perusahaan / organisasi",
      "duration": "Periode (contoh: Jan 2023 - Saat ini atau 2022 - 2023)",
      "description": "Deskripsi tugas atau hasil kerja singkat"
    }
  ],
  "education": [
    {
      "institution": "Nama institusi / universitas / sekolah",
      "degree": "Jenjang & jurusan (contoh: S1 Ilmu Komunikasi, SMK Teknik Komputer)",
      "year": "Tahun kelulusan atau rentang tahun (contoh: 2020 - 2024)"
    }
  ],
  "certifications": [
    {
      "name": "Nama sertifikasi / lisensi",
      "issuer": "Lembaga penerbit",
      "issueDate": ""
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}

Aturan Mutlak:
1. "name" WAJIB berupa nama lengkap orang asli, JANGAN masukkan teks judul seperti "Curriculum Vitae", "Resume", atau alamat email/kontak.
2. Masukkan semua keahlian/skill, tools, atau bahasa pemrograman ke dalam array "skills".
3. Kembalikan HANYA format JSON valid tanpa tanda kutip markdown (\`\`\`json).`;

  const aiResult = await callAiGateway({
    feature: 'linkedin_pdf_extractor',
    promptName: 'LinkedIn Profile PDF Fallback Extractor',
    prompt,
    systemPrompt:
      'Kamu adalah parser resume dan profil profesional yang sangat teliti dalam mengekstrak data dari berbagai template PDF (LinkedIn, Canva, Word) menjadi JSON murni yang terstruktur dan akurat.',
    temperature: 0.1,
    userId,
  });

  if (!aiResult?.text) {
    throw new Error('AI Gateway tidak mengembalikan respons teks.');
  }

  const jsonClean = aiResult.text.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '').trim();
  const parsed = JSON.parse(jsonClean);

  return {
    name: typeof parsed.name === 'string' ? parsed.name.trim() : '',
    headline: typeof parsed.headline === 'string' ? parsed.headline.trim() : '',
    about: typeof parsed.about === 'string' ? parsed.about.trim() : '',
    location: typeof parsed.location === 'string' ? parsed.location.trim() : '',
    connections: '',
    experience: Array.isArray(parsed.experience)
      ? parsed.experience.map((e: any) => ({
          role: typeof e.role === 'string' ? e.role.trim() : 'Pengalaman',
          company: typeof e.company === 'string' ? e.company.trim() : '',
          duration: typeof e.duration === 'string' ? e.duration.trim() : '',
          description: typeof e.description === 'string' ? e.description.trim() : '',
        }))
      : [],
    education: Array.isArray(parsed.education)
      ? parsed.education.map((ed: any) => ({
          institution: typeof ed.institution === 'string' ? ed.institution.trim() : '',
          degree: typeof ed.degree === 'string' ? ed.degree.trim() : '',
          year: typeof ed.year === 'string' ? ed.year.trim() : '',
        }))
      : [],
    certifications: Array.isArray(parsed.certifications)
      ? parsed.certifications.map((c: any) => ({
          name: typeof c.name === 'string' ? c.name.trim() : '',
          issuer: typeof c.issuer === 'string' ? c.issuer.trim() : '',
          issueDate: typeof c.issueDate === 'string' ? c.issueDate.trim() : '',
        }))
      : [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.map((p: any) => ({
          title: typeof p.title === 'string' ? p.title.trim() : '',
          description: typeof p.description === 'string' ? p.description.trim() : '',
        }))
      : [],
    skills: Array.isArray(parsed.skills)
      ? parsed.skills.filter((s: any) => typeof s === 'string' && s.trim().length > 0).map((s: string) => s.trim())
      : [],
  };
}

export async function parseLinkedInPdf(buffer: Buffer, userId?: string): Promise<ScrapedProfileData> {
  const parser = new PDFParse({ data: buffer });
  let fullText = '';
  try {
    const textResult = await parser.getText();
    fullText = textResult?.text || '';
  } finally {
    await parser.destroy().catch(() => null);
  }

  if (!fullText.trim()) {
    throw new Error('Dokumen PDF kosong atau tidak dapat dibaca.');
  }

  // 1. Prioritaskan parser heuristik lokal (0 token, kecepatan milidetik)
  let heuristicData: ScrapedProfileData | null = null;
  try {
    heuristicData = extractLinkedInProfileFromText(fullText);
  } catch (heuristicErr) {
    console.warn('[parseLinkedInPdf] Heuristik lokal gagal:', heuristicErr);
  }

  // 2. Jika hasil heuristik sudah lengkap dan valid, langsung kembalikan
  if (heuristicData && isHeuristicParseSufficient(heuristicData)) {
    return heuristicData;
  }

  // 3. Fallback AI jika format dokumen non-standar (Canva, Word, atau layout multi-kolom)
  try {
    const aiData = await parseLinkedInPdfWithAi(fullText, userId);
    if (aiData && (aiData.name || aiData.experience.length > 0 || aiData.skills.length > 0)) {
      if (heuristicData?.skills && heuristicData.skills.length > 0 && aiData.skills.length === 0) {
        aiData.skills = heuristicData.skills;
      }
      return aiData;
    }
  } catch (aiErr) {
    console.warn('[parseLinkedInPdf] AI Fallback gagal, menggunakan hasil terbaik dari heuristik:', aiErr);
  }

  // 4. Jaring pengaman: jika AI tidak tersedia, kembalikan data heuristik
  if (heuristicData) {
    return heuristicData;
  }

  throw new Error('Gagal mengekstrak profil dari berkas PDF ini.');
}

function extractLinkedInProfileFromText(rawText: string): ScrapedProfileData {
  // Bersihkan karakter baris & spasi ganda
  const clean = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);

  const result: ScrapedProfileData = {
    name: '',
    headline: '',
    about: '',
    location: '',
    connections: '',
    experience: [],
    education: [],
    certifications: [],
    skills: [],
  };

  if (lines.length === 0) return result;

  // Baris pertama di resume LinkedIn adalah Nama Lengkap
  result.name = lines[0] || '';

  // Baris berikutnya biasanya headline & lokasi sebelum section pertama
  let headerIndex = 1;
  const headlineParts: string[] = [];
  while (
    headerIndex < Math.min(lines.length, 6) &&
    !isSectionHeader(lines[headerIndex])
  ) {
    headlineParts.push(lines[headerIndex]);
    headerIndex++;
  }
  if (headlineParts.length > 0) {
    result.headline = headlineParts[0];
    if (headlineParts.length > 1) {
      result.location = headlineParts[headlineParts.length - 1];
    }
  }

  // Segmentasi Section
  const sections: Record<string, string[]> = {};
  let currentSection = 'HEADER';
  sections[currentSection] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const detectedHeader = detectSectionHeader(line);
    if (detectedHeader) {
      currentSection = detectedHeader;
      if (!sections[currentSection]) sections[currentSection] = [];
    } else {
      sections[currentSection].push(line);
    }
  }

  // 1. Ringkasan / Summary
  const aboutLines = sections['SUMMARY'] || [];
  result.about = aboutLines.join('\n');

  // 2. Keahlian Utama / Skills
  const skillLines = sections['SKILLS'] || [];
  result.skills = skillLines
    .flatMap((s) => s.split(/[•,·]/))
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && !s.toLowerCase().includes('page') && !s.toLowerCase().includes('halaman'));

  // 3. Pengalaman / Experience
  const expLines = sections['EXPERIENCE'] || [];
  result.experience = parseExperienceBlock(expLines);

  // 4. Pendidikan / Education
  const eduLines = sections['EDUCATION'] || [];
  result.education = parseEducationBlock(eduLines);

  // 5. Sertifikasi / Certifications
  const certLines = sections['CERTIFICATIONS'] || [];
  result.certifications = parseCertificationsBlock(certLines);

  return result;
}

function isSectionHeader(line: string): boolean {
  return !!detectSectionHeader(line);
}

function detectSectionHeader(line: string): string | null {
  const norm = line.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (['summary', 'ringkasan', 'tentang', 'about'].includes(norm)) return 'SUMMARY';
  if (['experience', 'pengalaman', 'pengalaman kerja'].includes(norm)) return 'EXPERIENCE';
  if (['education', 'pendidikan'].includes(norm)) return 'EDUCATION';
  if (['top skills', 'keahlian utama', 'skills', 'keahlian'].includes(norm)) return 'SKILLS';
  if (['certifications', 'sertifikasi', 'licenses & certifications'].includes(norm)) return 'CERTIFICATIONS';
  if (['languages', 'bahasa'].includes(norm)) return 'LANGUAGES';
  if (['publications', 'publikasi'].includes(norm)) return 'PUBLICATIONS';
  return null;
}

function parseExperienceBlock(lines: string[]) {
  const experiences: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }> = [];

  let currentExp: {
    role: string;
    company: string;
    duration: string;
    descLines: string[];
  } | null = null;

  const datePattern = /(jan|feb|mar|apr|may|mei|jun|jul|aug|agu|sep|oct|okt|nov|dec|des|\d{4}).*(\d{4}|present|saat ini)/i;

  for (const line of lines) {
    if (line.match(datePattern)) {
      if (currentExp) {
        experiences.push({
          role: currentExp.role,
          company: currentExp.company,
          duration: currentExp.duration,
          description: currentExp.descLines.join(' ').trim(),
        });
      }
      currentExp = {
        role: '',
        company: '',
        duration: line,
        descLines: [],
      };
    } else if (currentExp) {
      if (!currentExp.company) {
        currentExp.company = line;
      } else if (!currentExp.role) {
        currentExp.role = line;
      } else {
        currentExp.descLines.push(line);
      }
    } else {
      // Baris sebelum baris durasi pertama
      currentExp = {
        role: line,
        company: '',
        duration: '',
        descLines: [],
      };
    }
  }

  if (currentExp && (currentExp.company || currentExp.role)) {
    experiences.push({
      role: currentExp.role || currentExp.company,
      company: currentExp.company || 'Perusahaan',
      duration: currentExp.duration,
      description: currentExp.descLines.join(' ').trim(),
    });
  }

  return experiences;
}

function parseEducationBlock(lines: string[]) {
  const educations: Array<{
    degree: string;
    institution: string;
    year: string;
  }> = [];

  let current: { institution: string; degree: string; year: string } | null = null;
  const yearPattern = /\b(19\d\d|20\d\d)\b/;

  for (const line of lines) {
    if (yearPattern.test(line)) {
      if (current) current.year = line;
    } else if (!current) {
      current = { institution: line, degree: '', year: '' };
    } else if (!current.degree) {
      current.degree = line;
    } else {
      educations.push(current);
      current = { institution: line, degree: '', year: '' };
    }
  }

  if (current && current.institution) {
    educations.push(current);
  }

  return educations;
}

function parseCertificationsBlock(lines: string[]) {
  const certs: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    credentialId?: string;
  }> = [];

  for (let i = 0; i < lines.length; i += 2) {
    const name = lines[i];
    const issuer = lines[i + 1] || '';
    if (name) {
      certs.push({
        name,
        issuer,
        issueDate: '',
      });
    }
  }

  return certs;
}
