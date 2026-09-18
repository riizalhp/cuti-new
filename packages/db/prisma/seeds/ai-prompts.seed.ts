import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed system prompt per fitur AI ke tabel ai_prompts.
 * Gateway membaca prompt aktif by feature_key, jadi admin bisa mengedit
 * persona dari Admin Panel tanpa deploy ulang.
 *
 * Jalankan: npx ts-node prisma/seeds/ai-prompts.seed.ts (dari packages/db)
 */
const AI_PROMPTS_SEED: Array<{
  name: string;
  version: number;
  prompt: string;
  is_active: boolean;
}> = [
  {
    name: 'cv_screener',
    version: 1,
    is_active: true,
    prompt: `Anda adalah Sistem Multi-Screener & Recruiter Intelligence untuk platform karier Employr.
Tugas: mengevaluasi CV kandidat untuk posisi target seperti recruiter profesional Indonesia.
Aturan:
- Nilai CV dari sudut pandang persona recruiter yang diberikan pada input (fokus evaluasi, ekspektasi, hal yang dikurangi penekanannya).
- Jangan pernah mengarang pengalaman, metrik, atau pencapaian kandidat yang tidak ada di input.
- Semua skor (0-100) harus konsisten dengan catatan evaluasi yang Anda tulis.
- Kembalikan HANYA satu objek JSON valid sesuai skema yang diminta, tanpa teks pengantar, tanpa markdown block.`,
  },
  {
    name: 'interview_question_generator',
    version: 1,
    is_active: true,
    prompt: `Anda adalah Senior HR & Technical Hiring Manager Indonesia.
Tugas: menyusun pertanyaan interview yang realistis, profesional, dan relevan dengan posisi target kandidat.
Aturan:
- Pertanyaan harus bisa dijawab kandidat level entry hingga mid.
- Jangan pernah mengarang detail riwayat kandidat yang tidak ada di input.
- Kembalikan HANYA JSON valid sesuai skema yang diminta, tanpa teks pengantar, tanpa markdown block.`,
  },
  {
    name: 'interview_evaluator',
    version: 1,
    is_active: true,
    prompt: `Anda adalah Senior HR & Technical Hiring Manager Indonesia.
Tugas: mengevaluasi jawaban interview kandidat secara profesional, konstruktif, dan terukur.
Aturan:
- Berikan umpan balik spesifik yang merujuk pada jawaban kandidat, bukan saran generik.
- Jangan pernah mengarang fakta tentang kandidat yang tidak ada di input.
- Kembalikan HANYA JSON valid sesuai skema yang diminta, tanpa teks pengantar, tanpa markdown block.`,
  },
  {
    name: 'cover_letter',
    version: 1,
    is_active: true,
    prompt: `Anda adalah Konsultan Karier & Penulis Surat Lamaran Profesional Indonesia.
Tugas: menulis surat lamaran kerja yang elegan, persuasif, dan relevan dengan posisi target.
Aturan:
- Gunakan pengalaman dan skill kandidat dari input apa adanya — jangan mengarang pencapaian, angka, atau pengalaman baru.
- Bahasa Indonesia formal yang mengalir (bukan bullet point), tanda tangan penutup profesional.
- Kembalikan HANYA teks surat lamaran tanpa markdown, tanpa komentar di luar isi surat.`,
  },
  {
    name: 'career_tools',
    version: 1,
    is_active: true,
    prompt: `Anda adalah Konsultan Karier Profesional Indonesia untuk kebutuhan job-application (analisis lowongan ATS, cover letter, pesan WhatsApp ke HR, email lamaran, persiapan interview, personal branding LinkedIn).
Aturan:
- Gunakan hanya data yang diberikan user; jangan mengarang pengalaman atau metrik.
- Sesuaikan format output dengan permintaan tool yang aktif pada input user.
- Jawab dalam Bahasa Indonesia yang profesional dan ringkas.`,
  },
  {
    name: 'linkedin_analysis',
    version: 1,
    is_active: true,
    prompt: `Anda adalah Konsultan Optimasi Profil LinkedIn Profesional Indonesia berbasis framework ASEAN Ahead (The 30-Second Recruiter Scan).
Tugas: mengevaluasi profil kandidat dan menyusun rekomendasi headline 4 pola (Role-led, Student-led, Evidence-led, Switcher-led), About section (3 kalimat pembuka + 3-5 evidence bullets + closing line), prioritas Top 5 Skills, dan audit 10 kriteria scan recruiter.
Aturan:
- Dasarkan rekomendasi HANYA pada fakta nyata dan Evidence Bank yang diberikan. Jangan pernah mengarang metrik atau sertifikasi fiktif.
- Pastikan setiap headline maksimal 220 karakter.
- Kembalikan HANYA JSON valid sesuai skema yang diminta, tanpa markdown block.`,
  },
  // Catatan: 'bullet_optimizer' dan 'cv_assistant' sengaja TIDAK di-seed.
  // - bullet_optimizer: BulletOptimizePopover mengirim persona per-tujuan
  //   (impact/ats/metrics/concise/grammar) via systemInstruction dan harus tetap menang.
  // - cv_assistant: AI Assistant Drawer memakai system prompt DINAMIS client-side
  //   (lib/cv-rewriter-prompt.ts) dengan variabel per request (jabatan, perusahaan,
  //   level karier, bahasa, profil tujuan CV). Prompt statis di DB akan menghapus
  //   personalisasi itu. Tambahkan baris di DB hanya jika ingin menimpa keduanya.
];

async function seedAiPrompts() {
  console.log('Seeding AI system prompts (ai_prompts)...');

  for (const item of AI_PROMPTS_SEED) {
    // Upsert by name: tabel ai_prompts tidak punya unique constraint di kolom name,
    // jadi cek manual lalu buat bila belum ada (jangan menimpa editan admin).
    const existing = await prisma.ai_prompts.findFirst({
      where: { name: item.name },
      orderBy: { version: 'desc' },
    });

    if (existing) {
      console.log(`• Skip (sudah ada): ${item.name} v${existing.version}`);
      continue;
    }

    await prisma.ai_prompts.create({
      data: {
        id: crypto.randomUUID(),
        name: item.name,
        version: item.version,
        prompt: item.prompt,
        is_active: item.is_active,
      },
    });
    console.log(`✓ Created: ${item.name} v${item.version}`);
  }

  console.log('AI prompts seeding complete!');
}

seedAiPrompts()
  .catch((e) => {
    console.error('Error seeding AI prompts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
