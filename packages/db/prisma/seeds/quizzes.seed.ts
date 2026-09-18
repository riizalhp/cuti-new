/**
 * Seed: quiz packages & questions dari data hardcoded LatihanSoalView.
 * Jalankan: npx ts-node prisma/seeds/quizzes.seed.ts (dari packages/db)
 * Idempotent: upsert berdasarkan slug.
 */
import { PrismaClient } from '../../src/generated/client/index.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

type QuestionSeed = {
  type: 'multiple-choice' | 'short-answer' | 'multiple-select';
  question: string;
  codeSnippet?: string;
  options?: Array<{ id: string; text: string }>;
  correctAnswer: string | string[];
  explanation: string;
  aiTip?: string;
};

type PackageSeed = {
  slug: string;
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  difficulty: string;
  isPremium: boolean;
  price: number;
  passingScore: number;
  sortOrder: number;
  questions: QuestionSeed[];
};

const quizData: PackageSeed[] = [
  {
    slug: 'quiz-bumn-tkd-1',
    title: 'Simulasi TKD BUMN & Core Values AKHLAK 2026',
    category: 'BUMN & CPNS',
    description: 'Latihan soal standar BUMN terbaru mencakup Verbal, Numerik, Logika, dan Core Values AKHLAK BUMN.',
    durationMinutes: 15,
    difficulty: 'HOTS',
    isPremium: true,
    price: 29000,
    passingScore: 75,
    sortOrder: 1,
    questions: [
      {
        type: 'multiple-choice',
        question: 'Pilihlah padanan kata (analogi) yang paling tepat: MOBIL : BENSIN = MANUSIA : ...',
        options: [
          { id: 'A', text: 'Oksigen' },
          { id: 'B', text: 'Makanan' },
          { id: 'C', text: 'Air' },
          { id: 'D', text: 'Olahraga' },
          { id: 'E', text: 'Jantung' },
        ],
        correctAnswer: 'B',
        explanation: 'Mobil membutuhkan bahan bakar berupa BENSIN untuk dapat berjalan, sebagaimana Manusia membutuhkan bahan bakar berupa MAKANAN untuk energi hidup.',
        aiTip: 'Cari hubungan fungsional spesifik: [Objek] membutuhkan [Sumber Energi Utama].',
      },
      {
        type: 'multiple-choice',
        question: 'Nilai dari 12,5% dari 640 adalah ...',
        options: [
          { id: 'A', text: '60' },
          { id: 'B', text: '70' },
          { id: 'C', text: '80' },
          { id: 'D', text: '90' },
          { id: 'E', text: '100' },
        ],
        correctAnswer: 'C',
        explanation: '12,5% sama dengan pecahan 1/8. Maka 1/8 x 640 = 80.',
        aiTip: 'Hafalkan pecahan istimewa: 12,5% = 1/8. 640 / 8 = 80 dengan sangat cepat!',
      },
      {
        type: 'multiple-select',
        question: 'Pilihlah DUA prinsip utama yang termasuk dalam Core Values AKHLAK BUMN:',
        options: [
          { id: 'A', text: 'Amanah (Memegang teguh kepercayaan)' },
          { id: 'B', text: 'Individualis (Bekerja secara mandiri tanpa tim)' },
          { id: 'C', text: 'Harmonis (Saling peduli dan menghargai perbedaan)' },
          { id: 'D', text: 'Komersialisasi (Mengutamakan keuntungan probadi)' },
        ],
        correctAnswer: ['A', 'C'],
        explanation: 'Core Values AKHLAK BUMN adalah Amanah, Kompeten, Harmonis, Loyal, Adaptif, dan Kolaboratif.',
        aiTip: 'AKHLAK singkatan dari Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif.',
      },
      {
        type: 'short-answer',
        question: 'Deret angka: 2, 4, 8, 16, 32, ... Berapakah angka berikutnya?',
        correctAnswer: '64',
        explanation: 'Pola deret angka adalah perkalian 2 berturut-turut: 2x2=4, 4x2=8, 8x2=16, 16x2=32, 32x2=64.',
        aiTip: 'Deret geometri rasio r = 2.',
      },
      {
        type: 'multiple-choice',
        question: 'Sikap karyawan saat menghadapi perubahan teknologi sistem kerja di BUMN yang relevan dengan poin ADAPTIF adalah ...',
        options: [
          { id: 'A', text: 'Menolak karena sistem lama sudah nyaman' },
          { id: 'B', text: 'Proaktif mempelajari sistem baru dan terus berinovasi' },
          { id: 'C', text: 'Menunggu instruksi eksplisit tanpa inisiatif' },
          { id: 'D', text: 'Mengeluhkan kerumitan teknologi baru kepada rekan' },
        ],
        correctAnswer: 'B',
        explanation: 'Perilaku Adaptif mencakup cepat menyesuaikan diri untuk menjadi lebih baik, terus berinovasi, dan bertindak proaktif.',
        aiTip: 'Jawaban terbaik untuk tes kepribadian BUMN selalu mencerminkan inisiatif positif dan orientasi solusi.',
      },
    ],
  },
  {
    slug: 'quiz-react-frontend-1',
    title: 'Frontend React.js & Modern JavaScript Assessment',
    category: 'Tech & Coding',
    description: 'Uji pemahaman Hook, State Management, Virtual DOM, dan ES6+ untuk persiapan technical interview.',
    durationMinutes: 20,
    difficulty: 'Sedang',
    isPremium: false,
    price: 0,
    passingScore: 70,
    sortOrder: 2,
    questions: [
      {
        type: 'multiple-choice',
        question: 'Hook manakah di React yang digunakan untuk menangani side-effects seperti data fetching dan event listener?',
        options: [
          { id: 'A', text: 'useState' },
          { id: 'B', text: 'useEffect' },
          { id: 'C', text: 'useContext' },
          { id: 'D', text: 'useMemo' },
        ],
        correctAnswer: 'B',
        explanation: 'useEffect dirancang khusus untuk mengelola efek samping (side effects) dalam komponen fungsional React.',
        aiTip: 'Ingat: useState untuk simpan data lokal, useEffect untuk interaksi eksternal/lifecycle.',
      },
      {
        type: 'multiple-choice',
        question: 'Apa keluaran dari baris kode berikut? console.log(typeof NaN);',
        codeSnippet: 'console.log(typeof NaN);',
        options: [
          { id: 'A', text: '"number"' },
          { id: 'B', text: '"NaN"' },
          { id: 'C', text: '"undefined"' },
          { id: 'D', text: '"object"' },
        ],
        correctAnswer: 'A',
        explanation: 'Di JavaScript, NaN (Not-a-Number) secara teknis memiliki tipe data "number" menurut spesifikasi ECMAScript.',
        aiTip: 'Pertanyaan jebakan populer di interview JS! NaN singkatan Not a Number tapi tipenya number.',
      },
      {
        type: 'short-answer',
        question: 'Tuliskan nama metode array JavaScript yang digunakan untuk menghasilkan array baru berukuran sama berdasarkan transformasi fungsi callback (contoh: arr.___()):',
        correctAnswer: 'map',
        explanation: 'Array.prototype.map() mengembalikan array baru yang merupakan hasil transformasi tiap elemen.',
        aiTip: 'Gunakan map() untuk merender list elemen JSX di React.',
      },
      {
        type: 'multiple-select',
        question: 'Pilihlah pernyataan yang BENAR mengenai perbedaan antara Server Component dan Client Component di Next.js App Router:',
        options: [
          { id: 'A', text: 'Server Component secara default tidak mengirimkan bundle JavaScript ke client.' },
          { id: 'B', text: 'Client Component harus diawali dengan direktif "use client" di baris paling atas.' },
          { id: 'C', text: 'Server Component dapat menggunakan hook useState dan useEffect.' },
          { id: 'D', text: 'Client Component dapat mengakses variabel lingkungan rahasia server (tanpa NEXT_PUBLIC).' },
        ],
        correctAnswer: ['A', 'B'],
        explanation: 'Server Component bersifat nol JavaScript client-side bundle & Client Component butuh direktif "use client". Hook React seperti useState HANYA bisa di Client Component.',
        aiTip: 'Server Component = cepat & secure, Client Component = interaktif & React hooks.',
      },
    ],
  },
  {
    slug: 'quiz-cpns-twk-1',
    title: 'SKD CPNS 2026 — Tes Wawasan Kebangsaan (TWK)',
    category: 'BUMN & CPNS',
    description: 'Latihan soal TWK mencakup Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, dan Nasionalisme.',
    durationMinutes: 15,
    difficulty: 'Sedang',
    isPremium: true,
    price: 19000,
    passingScore: 65,
    sortOrder: 3,
    questions: [
      {
        type: 'multiple-choice',
        question: 'Pengakuan persamaan derajat, hak, dan kewajiban antara sesama manusia merupakan cerminan dari sila Pancasila ke-...',
        options: [
          { id: 'A', text: 'Sila ke-1' },
          { id: 'B', text: 'Sila ke-2' },
          { id: 'C', text: 'Sila ke-3' },
          { id: 'D', text: 'Sila ke-4' },
          { id: 'E', text: 'Sila ke-5' },
        ],
        correctAnswer: 'B',
        explanation: 'Sila ke-2 (Kemanusiaan yang Adil dan Beradab) mengandung nilai kemanusiaan, kesetaraan hak, dan rasa empati sesama manusia.',
        aiTip: 'Sila 2 = Hubungan antar-manusia/HAM. Sila 5 = Keadilan sosial & kesejahteraan publik.',
      },
      {
        type: 'short-answer',
        question: 'Sebutkan jumlah pasal dalam UUD 1945 setelah amandemen keempat (ketik angka saja):',
        correctAnswer: '73',
        explanation: 'Hasil amandemen UUD 1945 menghasilkan 73 pasal, 170 ayat, 3 pasal aturan peralihan, dan 2 pasal aturan tambahan.',
        aiTip: 'Ingat angka kunci UUD 1945 post-amandemen: 73 pasal.',
      },
      {
        type: 'multiple-choice',
        question: 'Semboyan Bhinneka Tunggal Ika dipetik dari kitab kuno karangan Empu Tantular, yaitu Kitab ...',
        options: [
          { id: 'A', text: 'Negarakertagama' },
          { id: 'B', text: 'Sutasoma' },
          { id: 'C', text: 'Arjunawijaya' },
          { id: 'D', text: 'Pararaton' },
        ],
        correctAnswer: 'B',
        explanation: 'Frasa "Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa" terdapat dalam Kitab Sutasoma karya Empu Tantular pada zaman Majapahit.',
        aiTip: 'Sutasoma = Bhinneka Tunggal Ika, Negarakertagama = Mpu Prapanca (Istilah Pancasila).',
      },
      {
        type: 'multiple-choice',
        question: 'Berdasarkan UUD 1945, kekuasaan kehakiman di Indonesia dilakukan oleh Mahkamah Agung dan ...',
        options: [
          { id: 'A', text: 'Mahkamah Konstitusi' },
          { id: 'B', text: 'Komisi Yudisial' },
          { id: 'C', text: 'Kejaksaan Agung' },
          { id: 'D', text: 'Dewan Perwakilan Rakyat' },
        ],
        correctAnswer: 'A',
        explanation: 'Pasal 24 Ayat (2) UUD 1945 menyatakan kekuasaan kehakiman dilakukan oleh MA dan badan peradilan di bawahnya serta oleh sebuah Mahkamah Konstitusi.',
        aiTip: 'Lembaga Yudisial pemegang kekuasaan kehakiman = MA & MK. KY bertugas mengawasi hakim.',
      },
    ],
  },
  {
    slug: 'quiz-toefl-structure-1',
    title: 'TOEFL Structure & Written Expression Practice',
    category: 'Bahasa & TOEFL',
    description: 'Latihan soal Grammar, Subject-Verb Agreement, Inversion, dan Error Identification untuk skor TOEFL 550+.',
    durationMinutes: 10,
    difficulty: 'HOTS',
    isPremium: false,
    price: 0,
    passingScore: 80,
    sortOrder: 4,
    questions: [
      {
        type: 'multiple-choice',
        question: 'Pilihlah kata yang paling tepat untuk melengkapi kalimat: Neither the manager nor the employees ___ aware of the new policy.',
        options: [
          { id: 'A', text: 'was' },
          { id: 'B', text: 'were' },
          { id: 'C', text: 'is' },
          { id: 'D', text: 'be' },
        ],
        correctAnswer: 'B',
        explanation: 'Pada struktur "Neither ... nor ...", kata kerja (verb) mengikuti subjek yang terletak PALING DEKAT dengannya ("the employees" -> plural -> "were").',
        aiTip: 'Aturan Proximity: Subjek terdekat dengan verb menentukan singular/plural.',
      },
      {
        type: 'multiple-choice',
        question: 'Pilihlah bentuk yang tepat: Hardly ___ finished his presentation when the power went out.',
        options: [
          { id: 'A', text: 'he had' },
          { id: 'B', text: 'had he' },
          { id: 'C', text: 'he has' },
          { id: 'D', text: 'did he' },
        ],
        correctAnswer: 'B',
        explanation: 'Keterangan negatif seperti "Hardly", "Seldom", "Never" di awal kalimat memerlukan pola inversi (Auxiliary Verb + Subject).',
        aiTip: 'Negative Inversion Formula: Hardly + Had + Subject + V3 + when...',
      },
      {
        type: 'short-answer',
        question: 'Sebutkan kata sifat (adjective) dalam kalimat berikut: "She solved the difficult puzzle quickly."',
        correctAnswer: 'difficult',
        explanation: 'Kata "difficult" menerangkan kata benda "puzzle", sehingga berfungsi sebagai kata sifat (adjective). Sedangkan "quickly" adalah adverb.',
        aiTip: 'Adjective = menerangkan Noun (difficult puzzle). Adverb = menerangkan Verb (solved quickly).',
      },
    ],
  },
];

async function main() {
  console.log('Seeding quiz packages...');

  for (const pkg of quizData) {
    const saved = await prisma.quiz_packages.upsert({
      where: { slug: pkg.slug },
      update: {
        title: pkg.title,
        category: pkg.category,
        description: pkg.description,
        duration_minutes: pkg.durationMinutes,
        difficulty: pkg.difficulty,
        is_premium: pkg.isPremium,
        price: pkg.price,
        passing_score: pkg.passingScore,
        sort_order: pkg.sortOrder,
        is_active: true,
      },
      create: {
        id: crypto.randomUUID(),
        slug: pkg.slug,
        title: pkg.title,
        category: pkg.category,
        description: pkg.description,
        duration_minutes: pkg.durationMinutes,
        difficulty: pkg.difficulty,
        is_premium: pkg.isPremium,
        price: pkg.price,
        passing_score: pkg.passingScore,
        sort_order: pkg.sortOrder,
      },
    });

    // Ganti pertanyaan lama dengan versi seed (seed = sumber kebenaran soal)
    await prisma.quiz_questions.deleteMany({ where: { package_id: saved.id } });
    await prisma.quiz_questions.createMany({
      data: pkg.questions.map((q, idx) => ({
        id: crypto.randomUUID(),
        package_id: saved.id,
        sort_order: idx + 1,
        type: q.type,
        question: q.question,
        code_snippet: q.codeSnippet ?? null,
        options: q.options ?? undefined,
        correct_answer: q.correctAnswer as any,
        explanation: q.explanation,
        ai_tip: q.aiTip ?? null,
      })),
    });

    console.log(`  ✓ ${pkg.slug} (${pkg.questions.length} soal)`);
  }

  console.log('Seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
