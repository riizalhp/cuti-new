import { PrismaClient, WorkType } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const articleCategories = [
  { name: 'Optimasi CV', slug: 'optimasi-cv' },
  { name: 'Persiapan Interview', slug: 'persiapan-interview' },
  { name: 'Strategi Melamar', slug: 'strategi-melamar' },
];

const articles = [
  {
    title: 'Cara Membuat CV ATS Friendly yang Lolos Screening HR',
    category: 'Optimasi CV',
    content:
      'Sistem ATS memfilter ribuan CV berdasarkan kata kunci. Gunakan font standar, hindari grafik kompleks, serta cantumkan kata kunci yang tertera di syarat pekerjaan. Pelajari struktur penulisan, kata kunci penting, dan format file terbaik agar CV kamu dibaca sempurna oleh software rekrutmen ATS.',
    author: 'Tim Employr',
  },
  {
    title: '20 Pertanyaan Interview Tersering & Cara Menjawabnya',
    category: 'Persiapan Interview',
    content:
      'Gunakan teknik STAR (Situation, Task, Action, Result). Jelaskan situasi yang pernah dialami, tugas yang diemban, serta hasil terukur. Panduan menjawab pertanyaan "Ceritakan tentang diri Anda" hingga strategi menjawab pertanyaan tentang kelemahan dengan metode STAR.',
    author: 'Tim Employr',
  },
  {
    title: 'Panduan Lengkap Cara Melamar Kerja via Email & WA',
    category: 'Strategi Melamar',
    content:
      'Selalu gunakan email profesional. Gunakan subject yang jelas seperti "Lamaran Pekerjaan - [Posisi] - [Nama]". Etika, penulisan subject email, serta draf kalimat pengantar yang sopan untuk menarik perhatian recruiter.',
    author: 'Tim Employr',
  },
];

const courses = [
  {
    title: 'Masterclass Excel & Data Analysis untuk HR/Admin',
    description:
      'Kuasai VLOOKUP, Pivot Table, dan visualisasi data dasar untuk meningkatkan efisiensi kerja admin & HR.',
    instructor: 'RuangKerja Academy',
    durationHours: 12,
    level: 'Pemula s/d Menengah',
    price: 0,
    externalUrl: 'https://loker.employr.id',
  },
  {
    title: 'Dasar Pemrograman Web Frontend dengan React & Next.js',
    description:
      'Belajar HTML, CSS, JavaScript Modern, dan React dari nol hingga siap membangun portfolio web.',
    instructor: 'Dibimbing.id',
    durationHours: 30,
    level: 'Pemula',
    price: 250000,
    externalUrl: 'https://loker.employr.id',
  },
  {
    title: 'Digital Marketing Essentials & Social Media Campaign',
    description:
      'Pahami dasar Copywriting, Meta Ads, Google Analytics, dan strategi campaign sosial media.',
    instructor: 'RevoU Mini Course',
    durationHours: 8,
    level: 'Semua Tingkat',
    price: 0,
    externalUrl: 'https://loker.employr.id',
  },
];

const certifications = [
  {
    title: 'Sertifikasi Nasional BNSP - Administrative Assistant',
    description:
      'Pengakuan kompetensi nasional di bidang administrasi dan pengelolaan dokumen kantor.',
    provider: 'LSP Administrasi Perkantoran',
    price: 0,
    durationHours: 16,
    externalUrl: 'https://loker.employr.id',
  },
  {
    title: 'Google Digital Marketing & E-Commerce Certificate',
    description:
      'Sertifikasi resmi Google untuk profesi digital marketer & e-commerce specialist.',
    provider: 'Google via Coursera',
    price: 0,
    durationHours: 40,
    externalUrl: 'https://loker.employr.id',
  },
  {
    title: 'TOEIC Official English Proficiency Certificate',
    description:
      'Standar pengujian kemahiran bahasa Inggris internasional untuk kebutuhan dunia kerja modern.',
    provider: 'ETS Global',
    price: 0,
    durationHours: 0,
    externalUrl: 'https://loker.employr.id',
  },
];

const events = [
  {
    title: 'National Virtual Job Fair 2026 - 500+ Lowongan',
    description:
      'Pertemuan langsung fresh graduate dan profesional muda dengan 50+ BUMN & perusahaan multinasional.',
    eventDate: new Date('2026-08-15T00:00:00.000Z'),
    location: 'Online via Zoom & Portal',
    type: WorkType.ONLINE,
    externalUrl: 'https://loker.employr.id',
  },
  {
    title: 'Webinar: Rahasia Menembus Management Trainee BUMN',
    description:
      'Bedah tuntas tahapan seleksi berkas, online test, FGD, hingga interview user bersama praktisi MT.',
    eventDate: new Date('2026-08-12T12:00:00.000Z'),
    location: 'Live Google Meet',
    type: WorkType.ONLINE,
    externalUrl: 'https://loker.employr.id',
  },
  {
    title: 'Workshop Interactive CV Clinic & Mock Interview Direct Review',
    description:
      'Sesi konsultasi 1-on-1 bersama HR Manager untuk memperbaiki CV dan simulasi wawancara kerja.',
    eventDate: new Date('2026-08-20T00:00:00.000Z'),
    location: 'Jakarta Selatan & Online',
    type: WorkType.HYBRID,
    externalUrl: 'https://loker.employr.id',
  },
];

async function seedCareer() {
  console.log('Seeding career development content...');

  // 1. Article categories (upsert by slug)
  const categoryMap: Record<string, string> = {};
  for (const cat of articleCategories) {
    const saved = await prisma.article_categories.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    categoryMap[cat.name] = saved.id;
    console.log(`✓ Category: ${cat.name}`);
  }

  // 2. Articles (upsert by slug)
  for (const art of articles) {
    const slug = slugify(art.title);
    await prisma.articles.upsert({
      where: { slug },
      update: {
        title: art.title,
        content: art.content,
        author: art.author,
        is_published: true,
        published_at: new Date(),
        category_id: categoryMap[art.category],
      },
      create: {
        title: art.title,
        slug,
        content: art.content,
        author: art.author,
        is_published: true,
        published_at: new Date(),
        category_id: categoryMap[art.category],
      },
    });
    console.log(`✓ Article: ${art.title}`);
  }

  // 3. Courses (upsert by slug)
  for (const crs of courses) {
    const slug = slugify(crs.title);
    await prisma.courses.upsert({
      where: { slug },
      update: {
        title: crs.title,
        description: crs.description,
        instructor: crs.instructor,
        duration_hours: crs.durationHours,
        level: crs.level,
        price: crs.price,
        external_url: crs.externalUrl,
        is_active: true,
      },
      create: {
        title: crs.title,
        slug,
        description: crs.description,
        instructor: crs.instructor,
        duration_hours: crs.durationHours,
        level: crs.level,
        price: crs.price,
        external_url: crs.externalUrl,
        is_active: true,
      },
    });
    console.log(`✓ Course: ${crs.title}`);
  }

  // 4. Certifications (upsert by slug)
  for (const cert of certifications) {
    const slug = slugify(cert.title);
    await prisma.certifications.upsert({
      where: { slug },
      update: {
        title: cert.title,
        description: cert.description,
        provider: cert.provider,
        price: cert.price,
        duration_hours: cert.durationHours,
        external_url: cert.externalUrl,
        is_active: true,
      },
      create: {
        title: cert.title,
        slug,
        description: cert.description,
        provider: cert.provider,
        price: cert.price,
        duration_hours: cert.durationHours,
        external_url: cert.externalUrl,
        is_active: true,
      },
    });
    console.log(`✓ Certification: ${cert.title}`);
  }

  // 5. Events (upsert by slug)
  for (const ev of events) {
    const slug = slugify(ev.title);
    await prisma.events.upsert({
      where: { slug },
      update: {
        title: ev.title,
        description: ev.description,
        event_date: ev.eventDate,
        location: ev.location,
        type: ev.type,
        external_url: ev.externalUrl,
        is_active: true,
      },
      create: {
        title: ev.title,
        slug,
        description: ev.description,
        event_date: ev.eventDate,
        location: ev.location,
        type: ev.type,
        external_url: ev.externalUrl,
        is_active: true,
      },
    });
    console.log(`✓ Event: ${ev.title}`);
  }

  console.log('Career development seeding complete!');
}

seedCareer()
  .catch((e) => {
    console.error('Error seeding career content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
