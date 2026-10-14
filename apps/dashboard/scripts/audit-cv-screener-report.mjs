import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../e2e/review/audit-cv-screener-report');
fs.mkdirSync(OUT_DIR, { recursive: true });

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const AXE_PATH = 'D:\\cuti\\node_modules\\.pnpm\\axe-core@4.10.2\\node_modules\\axe-core\\axe.js';

const sessionUser = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

const BANNED_TERMS = [
  'ai', 'artificial intelligence', 'gpt', 'llm', 'prompt', 'prompting',
  'algorithm', 'machine learning', 'bot', 'robot', 'subscription', 'langganan',
  'bulanan', 'tahunan', 'monthly', 'yearly', 'generate', 'generated'
];

const mockActiveReport = {
  rveReport: {
    parsedData: {
      id: "cv-budi-1",
      candidateName: "Budi Santoso",
      roleTitle: "Frontend Developer",
      email: "budi.santoso@gmail.com",
      phone: "081234567890",
      location: "Jakarta, Indonesia",
      summary: "Lulusan SMK Rekayasa Perangkat Lunak dengan pengalaman magang frontend developer selama 6 bulan. Terbiasa membangun antarmuka web interaktif menggunakan React, Next.js, dan Tailwind CSS dengan prinsip mobile-first.",
      experience: [
        {
          id: "exp-1",
          role: "Frontend Developer Intern",
          company: "PT Solusi Teknologi Indonesia",
          period: "Januari 2024 - Juni 2024",
          achievements: [
            "Mengembangkan 8 modul antarmuka web berbasis Next.js dan Tailwind CSS dengan standar aksesibilitas WCAG AA.",
            "Mengoptimalkan loading time website profil perusahaan hingga 35% lebih cepat melalui pemisahan modul.",
            "Berkolaborasi aktif dalam tim beranggotakan 4 pengembang menggunakan Git version control."
          ],
          metricsCount: 2
        }
      ],
      education: [
        {
          id: "edu-1",
          degree: "SMK Rekayasa Perangkat Lunak",
          institution: "SMK Negeri 1 Jakarta",
          period: "2021 - 2024",
          gpa: "89.0 / 100"
        }
      ],
      skills: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Git", "Figma", "HTML5", "CSS3"],
      hobbiesAndMisc: "Kontributor open source proyek lokal, gemar membaca dokumentasi teknologi."
    },
    boundingBoxes: [
      { id: "box-header", type: "header", x: 6, y: 4, width: 88, height: 10, visualWeight: 0.9, title: "Header & Kontak" },
      { id: "box-summary", type: "summary", x: 6, y: 16, width: 88, height: 12, visualWeight: 0.8, title: "Ringkasan Profil" },
      { id: "box-exp", type: "experience", x: 6, y: 30, width: 88, height: 34, visualWeight: 0.95, title: "Pengalaman Kerja" },
      { id: "box-edu", type: "education", x: 6, y: 66, width: 88, height: 14, visualWeight: 0.7, title: "Pendidikan" },
      { id: "box-skills", type: "skills", x: 6, y: 82, width: 88, height: 12, visualWeight: 0.75, title: "Keahlian Teknis" }
    ],
    fixationPoints: [
      { id: "fp-1", sectionId: "box-header", x: 15, y: 7, intensity: 0.95, durationMs: 850, label: "Nama & Target Posisi", order: 1, category: "hotspot" },
      { id: "fp-2", sectionId: "box-header", x: 60, y: 7, intensity: 0.8, durationMs: 550, label: "Kontak & Lokasi", order: 2, category: "warm" },
      { id: "fp-3", sectionId: "box-summary", x: 20, y: 18, intensity: 0.9, durationMs: 900, label: "Headline Ringkasan", order: 3, category: "hotspot" },
      { id: "fp-4", sectionId: "box-exp", x: 20, y: 33, intensity: 0.95, durationMs: 1200, label: "Posisi & Perusahaan Terakhir", order: 4, category: "hotspot" },
      { id: "fp-5", sectionId: "box-exp", x: 35, y: 42, intensity: 0.85, durationMs: 800, label: "Metrik Keberhasilan", order: 5, category: "warm" },
      { id: "fp-6", sectionId: "box-edu", x: 20, y: 69, intensity: 0.7, durationMs: 450, label: "Latar Belakang Pendidikan", order: 6, category: "medium" }
    ],
    overallAttentionScore: 88,
    fPatternScore: 90,
    atsScore: 86,
    recruiterVerdict: "Lolos Pre-Screening RVE Pipeline! Struktur visual dan narasi CV sangat memikat perhatian recruiter target dalam 6 detik pertama.",
    verdictStatus: "interview",
    confidenceScore: 92,
    hrdNotes: "Recruiter Vision Pipeline mencatat tata letak judul dan seksi pengalaman tersusun rapi. Keterbacaan pola-F sangat baik dengan fokus utama pada pengalaman Frontend Developer Intern.",
    atsCorrelations: [
      { id: "ats-1", keyword: "React.js", category: "Frontend Framework", foundInCv: true, visibilityScore: 95, atsScore: 92, quadrant: "gold", recommendation: "Pertahankan di baris atas ringkasan keahlian." },
      { id: "ats-2", keyword: "Next.js", category: "Web Framework", foundInCv: true, visibilityScore: 90, atsScore: 88, quadrant: "gold", recommendation: "Sangat relevan dengan kualifikasi startup modern." },
      { id: "ats-3", keyword: "TypeScript", category: "Programming Language", foundInCv: true, visibilityScore: 85, atsScore: 85, quadrant: "gold", recommendation: "Tercantum jelas pada daftar kompetensi teknis." },
      { id: "ats-4", keyword: "Tailwind CSS", category: "Styling", foundInCv: true, visibilityScore: 80, atsScore: 80, quadrant: "gold", recommendation: "Cocok untuk standar pengembangan frontend saat ini." }
    ],
    beforeAfterFixes: [
      {
        id: "fix-1",
        section: "Pengalaman Kerja",
        originalText: "Membantu membuat tampilan website perusahaan.",
        suggestedText: "Mengembangkan 8 modul antarmuka web berbasis Next.js dan Tailwind CSS dengan standar aksesibilitas WCAG AA.",
        reason: "Mengubah kalimat pasif menjadi kata kerja aktif terukur dengan metrik kuantitatif.",
        impactBonus: 5
      },
      {
        id: "fix-2",
        section: "Ringkasan Profil",
        originalText: "Saya lulusan baru yang mau belajar koding.",
        suggestedText: "Lulusan SMK Rekayasa Perangkat Lunak dengan pengalaman magang frontend developer selama 6 bulan, terbiasa membangun antarmuka web interaktif menggunakan React dan Next.js.",
        reason: "Menegaskan spesialisasi teknis dan pengalaman riil dibanding pernyataan generik.",
        impactBonus: 5
      }
    ],
    predictedInterviewQuestions: [
      {
        id: "q-1",
        question: "Ceritakan pengalaman kamu saat mengoptimalkan waktu loading website hingga 35% lebih cepat?",
        intent: "Menguji pemahaman teknis mengenai performa web dan teknik optimasi yang digunakan.",
        recommendedAnswer: "Jelaskan langkah nyata yang dilakukan, misalnya penerapan lazy loading gambar, optimalisasi ukuran bundle, dan pemisahan modul Next.js.",
        likelihood: "Tinggi (92%)"
      },
      {
        id: "q-2",
        question: "Bagaimana cara kamu memastikan antarmuka yang dibuat memenuhi standar aksesibilitas WCAG AA?",
        intent: "Melihat komitmen terhadap kualitas produk dan kepedulian terhadap kenyamanan pengguna.",
        recommendedAnswer: "Sampaikan bahwa kamu memeriksa rasio kontras warna, memastikan navigasi keyboard bekerja, dan menyertakan atribut ARIA yang tepat.",
        likelihood: "Tinggi (88%)"
      }
    ],
    aiEvaluations: [
      {
        modelName: "Pemeriksa Keterbacaan HRD (Recruiter Vision)",
        badgeColor: "bg-[#1738D1]",
        score: 90,
        pros: [
          "Zona pandang 6 detik pertama (F-Pattern) terbentuk optimal di area atas.",
          "Hierarki tipografi antara judul posisi dan institusi memiliki kontras yang tegas.",
          "Panjang ringkasan profil proporsional dan tidak menimbulkan kelelahan membaca."
        ],
        cons: [
          "Poin uraian kerja dapat ditambah dengan kata kerja aksi yang konsisten di awal baris."
        ]
      },
      {
        modelName: "Pemeriksa Dampak & Kualifikasi (Hiring Manager)",
        badgeColor: "bg-amber-500",
        score: 85,
        pros: [
          "Pengalaman magang membuktikan pemahaman operasional yang relevan.",
          "Keahlian teknis sesuai dengan tren industri teknologi saat ini."
        ],
        cons: [
          "Bisa diperkuat dengan tautan portofolio GitHub atau demo langsung."
        ]
      }
    ],
    consensusScore: 88,
    topAiSummary: {
      overview: "CV kamu memiliki fondasi yang sangat solid untuk meloloskan tahap awal seleksi.",
      dropReasons: ["Tingkatkan variasi kata kerja aksi pada poin kedua pengalaman."],
      estimatedProbability: 88
    },
    beforeAfterComparison: {
      beforeScore: 74,
      afterScore: 88,
      diff: 14
    },
    gamification: {
      progress: 88,
      checklist: [
        { id: "check-1", title: "Cantumkan target posisi yang jelas", isDone: true },
        { id: "check-2", title: "Sertakan minimal 1 metrik kuantitatif di pengalaman", isDone: true },
        { id: "check-3", title: "Gunakan kata kerja aksi di awal poin uraian", isDone: true }
      ]
    }
  },
  selectedPersonaId: "startup",
  activePurpose: "fresh_grad",
  targetRole: "Frontend Developer",
  targetLevel: "Entry",
  cvSourceMode: "saved",
  selectedCvId: "cv-budi-1",
  appliedFixes: ["fix-1"],
  selectedSavedCv: {
    id: "cv-budi-1",
    title: "CV Frontend Developer ATS",
    candidateName: "Budi Santoso",
    roleTitle: "Frontend Developer",
    email: "budi.santoso@gmail.com",
    phone: "081234567890",
    location: "Jakarta, Indonesia",
    summary: "Lulusan SMK Rekayasa Perangkat Lunak dengan pengalaman magang frontend developer selama 6 bulan. Terbiasa membangun antarmuka web interaktif menggunakan React, Next.js, dan Tailwind CSS dengan prinsip mobile-first.",
    experience: [
      {
        id: "exp-1",
        role: "Frontend Developer Intern",
        company: "PT Solusi Teknologi Indonesia",
        period: "Januari 2024 - Juni 2024",
        achievements: [
          "Mengembangkan 8 modul antarmuka web berbasis Next.js dan Tailwind CSS dengan standar aksesibilitas WCAG AA.",
          "Mengoptimalkan loading time website profil perusahaan hingga 35% lebih cepat melalui pemisahan modul.",
          "Berkolaborasi aktif dalam tim beranggotakan 4 pengembang menggunakan Git version control."
        ],
        metricsCount: 2
      }
    ],
    education: [
      {
        id: "edu-1",
        degree: "SMK Rekayasa Perangkat Lunak",
        institution: "SMK Negeri 1 Jakarta",
        period: "2021 - 2024",
        gpa: "89.0 / 100"
      }
    ],
    skills: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Git", "Figma", "HTML5", "CSS3"],
    pageCount: 2,
    pages: [
      { pageNumber: 1, sections: ["header", "summary", "experience", "skills"] },
      { pageNumber: 2, sections: ["education", "projects", "certifications"] }
    ]
  },
  targetBasis: "role",
  jobPosition: "Frontend Developer",
  jobCompany: "Tech Startup",
  jobDescription: "Mengembangkan antarmuka web modern dengan React dan Next.js",
  timestamp: Date.now()
};

async function runAudit() {
  console.log('1. Launching Microsoft Edge via Playwright...');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  try {
    // Audit Desktop
    console.log('2. Setting up desktop session (1440x900)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });

    const serialized = encodeURIComponent(JSON.stringify(sessionUser));
    await desktopContext.addCookies([
      { name: 'employr_user_session', value: serialized, domain: 'localhost', path: '/' },
      { name: 'cuti_user_session', value: serialized, domain: 'localhost', path: '/' },
      { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
    ]);

    await desktopContext.addInitScript(({ user, report }) => {
      try {
        localStorage.setItem('employr_user_session', JSON.stringify(user));
        localStorage.setItem('employr_onboarding_completed', 'true');
        localStorage.setItem('employr_active_screener_report', JSON.stringify(report));
      } catch (_) {}
    }, { user: sessionUser, report: mockActiveReport });

    const desktopPage = await desktopContext.newPage();
    console.log('3. Navigating to http://localhost:3000/cv-screener/report...');
    await desktopPage.goto(`${BASE}/cv-screener/report`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await desktopPage.waitForTimeout(3000);

    // Expand scroll containers and adjust viewport height so Playwright captures the entire report from top to bottom
    const totalHeight = await desktopPage.evaluate(() => {
      document.documentElement.style.height = 'auto';
      document.documentElement.style.overflow = 'visible';
      document.body.style.height = 'auto';
      document.body.style.overflow = 'visible';
      const root = document.getElementById('dashboard-root-layout');
      if (root) {
        root.style.height = 'auto';
        root.style.minHeight = 'auto';
        root.style.maxHeight = 'none';
        root.style.overflow = 'visible';
      }
      const main = document.getElementById('main-content-scroll');
      if (main) {
        main.style.overflow = 'visible';
        main.style.height = 'auto';
        main.style.maxHeight = 'none';
      }
      const parent = main?.parentElement;
      if (parent) {
        parent.style.height = 'auto';
        parent.style.maxHeight = 'none';
        parent.style.overflow = 'visible';
      }
      return Math.max(
        main?.scrollHeight || 0,
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
    });
    console.log(`Desktop total height: ${totalHeight}px`);
    await desktopPage.setViewportSize({ width: 1440, height: Math.max(900, totalHeight + 100) });
    await desktopPage.waitForTimeout(1500);

    const desktopScreenshotPath = path.join(OUT_DIR, 'desktop-report.png');
    await desktopPage.screenshot({ path: desktopScreenshotPath, fullPage: true });
    console.log(`Saved desktop screenshot to ${desktopScreenshotPath}`);

    // Inject axe-core and run accessibility audit
    console.log('4. Injecting axe-core for Microsoft Accessibility Insights / WCAG 2.1 AA audit...');
    const axeScript = fs.readFileSync(AXE_PATH, 'utf8');
    await desktopPage.evaluate(axeScript);

    const axeResults = await desktopPage.evaluate(async () => {
      // @ts-ignore
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      });
    });

    // Audit Mobile
    console.log('5. Setting up mobile session (375x812)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    await mobileContext.addCookies([
      { name: 'employr_user_session', value: serialized, domain: 'localhost', path: '/' },
      { name: 'cuti_user_session', value: serialized, domain: 'localhost', path: '/' },
      { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
    ]);
    await mobileContext.addInitScript(({ user, report }) => {
      try {
        localStorage.setItem('employr_user_session', JSON.stringify(user));
        localStorage.setItem('employr_onboarding_completed', 'true');
        localStorage.setItem('employr_active_screener_report', JSON.stringify(report));
      } catch (_) {}
    }, { user: sessionUser, report: mockActiveReport });

    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE}/cv-screener/report`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await mobilePage.waitForTimeout(3000);

    // Expand scroll containers and adjust viewport height for mobile screenshot
    const mobileTotalHeight = await mobilePage.evaluate(() => {
      document.documentElement.style.height = 'auto';
      document.documentElement.style.overflow = 'visible';
      document.body.style.height = 'auto';
      document.body.style.overflow = 'visible';
      const root = document.getElementById('dashboard-root-layout');
      if (root) {
        root.style.height = 'auto';
        root.style.minHeight = 'auto';
        root.style.maxHeight = 'none';
        root.style.overflow = 'visible';
      }
      const main = document.getElementById('main-content-scroll');
      if (main) {
        main.style.overflow = 'visible';
        main.style.height = 'auto';
        main.style.maxHeight = 'none';
      }
      const parent = main?.parentElement;
      if (parent) {
        parent.style.height = 'auto';
        parent.style.maxHeight = 'none';
        parent.style.overflow = 'visible';
      }
      return Math.max(
        main?.scrollHeight || 0,
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
    });
    console.log(`Mobile total height: ${mobileTotalHeight}px`);
    await mobilePage.setViewportSize({ width: 375, height: Math.max(812, mobileTotalHeight + 100) });
    await mobilePage.waitForTimeout(1500);

    const mobileScreenshotPath = path.join(OUT_DIR, 'mobile-report.png');
    await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: true });
    console.log(`Saved mobile screenshot to ${mobileScreenshotPath}`);

    // Scan text for banned slop terms
    console.log('6. Scanning page text for AI slop and Humanizer tells...');
    const pageText = await desktopPage.evaluate(() => document.body.innerText || '');
    
    const foundBanned = [];
    for (const term of BANNED_TERMS) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = pageText.match(regex);
      if (matches && matches.length > 0) {
        foundBanned.push({ term, count: matches.length });
      }
    }

    // Check em-dash count
    const emDashMatches = pageText.match(/—/g) || [];
    
    // Check "Bukan X, melainkan Y" pattern
    const bukanMelainkan = pageText.match(/bukan\s+[^,.\n]+,\s*(melainkan|tetapi)/gi) || [];

    const auditSummary = {
      timestamp: new Date().toISOString(),
      url: `${BASE}/cv-screener/report`,
      screenshots: {
        desktop: desktopScreenshotPath,
        mobile: mobileScreenshotPath,
      },
      accessibility: {
        violationsCount: axeResults.violations.length,
        violations: axeResults.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          nodesCount: v.nodes.length,
          nodes: v.nodes.slice(0, 3).map(n => ({
            target: n.target,
            html: n.html.slice(0, 100),
            failureSummary: n.failureSummary,
          })),
        })),
        passesCount: axeResults.passes.length,
        incompleteCount: axeResults.incomplete.length,
      },
      contentAudit: {
        foundBannedTerms: foundBanned,
        emDashCount: emDashMatches.length,
        bukanMelainkanTells: bukanMelainkan,
      },
    };

    const resultPath = path.join(OUT_DIR, 'audit-results.json');
    fs.writeFileSync(resultPath, JSON.stringify(auditSummary, null, 2), 'utf8');
    console.log(`Audit report saved to ${resultPath}`);
    console.log('\n--- AUDIT SUMMARY ---');
    console.log(`Axe Violations: ${auditSummary.accessibility.violationsCount}`);
    console.log(`Banned Terms Found: ${JSON.stringify(foundBanned)}`);
    console.log(`Em-Dashes: ${emDashMatches.length}`);
    console.log(`Bukan-Melainkan: ${bukanMelainkan.length}`);

  } finally {
    await browser.close();
  }
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
