import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import { callAiGateway } from '@/lib/ai-gateway';

export const dynamic = 'force-dynamic';

interface MatchRequestBody {
  cvId?: string;
  cvData?: any;
  position: string;
  company?: string;
  jobDescription: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body: MatchRequestBody = await req.json();

    const position = (body.position || '').trim();
    const company = (body.company || 'Perusahaan Target').trim();
    const jobDescription = (body.jobDescription || '').trim();

    if (!position || !jobDescription) {
      return NextResponse.json(
        { success: false, message: 'Posisi dan deskripsi lowongan kerja wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Resolve CV Data (dari database cvId atau payload langsung)
    let cvPayload = body.cvData || null;
    if (!cvPayload && body.cvId && user) {
      const cvProject = await prisma.cv_projects.findFirst({
        where: { id: body.cvId, user_id: user.id },
      });
      if (cvProject?.data) {
        cvPayload = cvProject.data;
      }
    }

    // Ekstraksi data skill dan teks pengalaman dari CV
    const cvSkills: string[] = [];
    let cvExperiencesText = '';
    let cvSummary = '';

    if (cvPayload && typeof cvPayload === 'object') {
      if (Array.isArray(cvPayload.skills)) {
        cvPayload.skills.forEach((s: any) => {
          const val = typeof s === 'string' ? s : s?.name || '';
          if (val && typeof val === 'string') cvSkills.push(val.trim());
        });
      }
      if (Array.isArray(cvPayload.experience)) {
        cvExperiencesText = cvPayload.experience
          .map((e: any) => `${e.role || e.title || ''} di ${e.company || ''}: ${e.description || ''}`)
          .join('\n');
      }
      cvSummary = cvPayload.summary || cvPayload.about || '';
    }

    // 2. Token Matching & Keyword Analysis Cepat (Lokal & Deterministik)
    const jdWords = Array.from(
      new Set(
        jobDescription
          .toLowerCase()
          .replace(/[^\w\s+#.-]/g, ' ')
          .split(/\s+/)
          .filter(
            (w) =>
              w.length >= 3 &&
              !/^(dan|yang|untuk|dengan|dari|pada|atau|kami|anda|bisa|akan|the|and|for|with|from|dalam|adalah|sebagai)$/i.test(
                w
              )
          )
      )
    );

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    // Cek kecocokan skill CV terhadap kata kunci lowongan
    cvSkills.forEach((skill) => {
      const sLower = skill.toLowerCase();
      if (
        jobDescription.toLowerCase().includes(sLower) ||
        jdWords.some((w) => sLower.includes(w) || w.includes(sLower))
      ) {
        if (!matchedKeywords.includes(skill)) matchedKeywords.push(skill);
      }
    });

    // Ambil kata kunci kualifikasi yang belum tercakup di CV
    jdWords.forEach((word) => {
      const alreadyMatched = cvSkills.some((s) => s.toLowerCase().includes(word));
      if (!alreadyMatched && !missingKeywords.includes(word) && missingKeywords.length < 8) {
        missingKeywords.push(word);
      }
    });

    const rawBaseScore = Math.min(94, Math.max(42, 42 + matchedKeywords.length * 8));
    const hardSkillsScore = Math.min(96, Math.max(45, rawBaseScore + 4));
    const softSkillsScore = Math.min(94, Math.max(40, rawBaseScore - 2));
    const expScore = Math.min(95, Math.max(38, cvExperiencesText ? rawBaseScore + 2 : rawBaseScore - 6));
    const eduScore = 80;

    const computedScore = Math.round(
      hardSkillsScore * 0.35 + softSkillsScore * 0.25 + expScore * 0.25 + eduScore * 0.15
    );

    // 3. Panggilan Sentuhan AI di Akhir (Actionable Gap Synthesizer)
    let strengths: string[] = [
      matchedKeywords.length > 0
        ? `Skill kamu (${matchedKeywords.slice(0, 3).join(', ')}) selaras dengan kebutuhan ${position} di ${company}.`
        : `Latar belakang umum kamu memiliki fondasi yang cukup untuk peran ${position}.`,
      'Struktur pengalaman menunjukkan kesiapan dalam kolaborasi dan eksekusi tugas.',
    ];

    let improvements: string[] = [
      missingKeywords.length > 0
        ? `Tambahkan bukti kompetensi terkait ${missingKeywords.slice(0, 3).join(', ')} di bagian keahlian atau deskripsi pengalaman.`
        : 'Perjelas pencapaian dengan metrik angka terukur pada riwayat kerja.',
    ];

    let actionableBullet = `Mengoptimalkan operasional dan alur kerja ${position} dengan mengaplikasikan ${matchedKeywords[0] || 'metode terstruktur'}, meningkatkan efisiensi tim sebesar 15%.`;
    let summaryVerdict = computedScore >= 75 ? 'Profil kamu sangat potensial untuk posisi ini.' : 'Perlu sedikit penyesuaian kata kunci untuk memperbesar peluang lolos ATS.';

    try {
      const aiPrompt = `Berikut adalah perbandingan antara profil CV pelamar dan persyaratan lowongan pekerjaan target:

DATA CV PELAMAR:
- Posisi Target CV: ${position}
- Daftar Keahlian CV: ${cvSkills.length > 0 ? cvSkills.join(', ') : 'Umum'}
- Ringkasan Pengalaman Kerja CV: ${cvExperiencesText.slice(0, 700) || 'Belum terisi lengkap'}
- Ringkasan Profil: ${cvSummary.slice(0, 300) || '-'}

DESKRIPSI LOWONGAN PEKERJAAN TARGET:
- Perusahaan: ${company}
- Posisi: ${position}
- Deskripsi Kualifikasi:
${jobDescription.slice(0, 1500)}

Tugasmu:
1. Berikan 2 poin kekuatan nyata pelamar yang paling selaras dengan kualifikasi lowongan ini (strengths).
2. Berikan 2 poin kekurangan/gap kualifikasi yang paling krusial dan perlu diperbaiki pelamar (improvements).
3. Buatkan 1 contoh revisi kalimat pengalaman kerja (actionableBullet) dengan formula Google XYZ (Tindakan terukur + Metrik angka/dampak + Cara pencapaian) yang relevan untuk dimasukkan pelamar ke CV-nya agar lolos screening lowongan ini.
4. Berikan 1 kalimat kesimpulan tingkat kecocokan (summaryVerdict).

Kembalikan HANYA format JSON murni:
{
  "strengths": ["poin 1", "poin 2"],
  "improvements": ["poin 1", "poin 2"],
  "actionableBullet": "Contoh kalimat peluru pengalaman yang kuat...",
  "summaryVerdict": "Kesimpulan singkat..."
}`;

      const aiRes = await callAiGateway({
        feature: 'ats_audit',
        promptName: 'CV-Job Match Synthesizer',
        prompt: aiPrompt,
        systemPrompt: 'Kamu adalah konsultan rekrutmen profesional yang memberikan feedback taktis, tajam, dan langsung dapat diterapkan pada CV pelamar.',
        temperature: 0.25,
        userId: user?.id,
      });

      if (aiRes?.text) {
        const cleanText = aiRes.text.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '').trim();
        const parsedAi = JSON.parse(cleanText);
        if (parsedAi) {
          if (Array.isArray(parsedAi.strengths) && parsedAi.strengths.length > 0) {
            strengths = parsedAi.strengths.slice(0, 2);
          }
          if (Array.isArray(parsedAi.improvements) && parsedAi.improvements.length > 0) {
            improvements = parsedAi.improvements.slice(0, 2);
          }
          if (typeof parsedAi.actionableBullet === 'string' && parsedAi.actionableBullet.trim()) {
            actionableBullet = parsedAi.actionableBullet.trim();
          }
          if (typeof parsedAi.summaryVerdict === 'string' && parsedAi.summaryVerdict.trim()) {
            summaryVerdict = parsedAi.summaryVerdict.trim();
          }
        }
      }
    } catch (aiErr) {
      console.warn('[CV Match API] AI synthesis fallback to deterministic:', aiErr);
    }

    const stars = computedScore >= 85 ? 5 : computedScore >= 75 ? 4 : computedScore >= 60 ? 3 : 2;
    const statusBadge =
      computedScore >= 85 ? 'Sangat Layak' : computedScore >= 75 ? 'Layak' : computedScore >= 60 ? 'Perlu Optimasi' : 'Kurang Cocok';
    const statusColor =
      computedScore >= 85 ? 'emerald' : computedScore >= 75 ? 'blue' : computedScore >= 60 ? 'amber' : 'rose';

    return NextResponse.json({
      success: true,
      data: {
        id: `match-${Date.now()}`,
        position,
        company,
        matchScore: computedScore,
        atsScore: Math.min(98, computedScore + 4),
        stars,
        statusBadge,
        statusColor,
        summaryVerdict,
        breakdown: {
          hardSkills: hardSkillsScore,
          softSkills: softSkillsScore,
          experience: expScore,
          education: eduScore,
        },
        matchedKeywords: matchedKeywords.slice(0, 8),
        missingKeywords: missingKeywords.slice(0, 6),
        strengths,
        improvements,
        actionableBullet,
      },
    });
  } catch (error: any) {
    console.error('[POST /api/cv/match] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses analisis kecocokan CV.' },
      { status: 500 }
    );
  }
}
