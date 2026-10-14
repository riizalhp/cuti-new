import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../e2e/review/cv-screener-mobile-audit');
fs.mkdirSync(OUT_DIR, { recursive: true });

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sessionUser = {
  id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  role: 'MEMBER',
  onboarded: true,
};

const mockReport = {
  rveReport: {
    parsedData: {
      id: "cv-budi-1",
      candidateName: "Budi Santoso",
      roleTitle: "Frontend Developer",
      email: "budi.santoso@gmail.com",
      phone: "081234567890",
      location: "Jakarta, Indonesia",
      summary: "Lulusan SMK Rekayasa Perangkat Lunak dengan pengalaman magang frontend developer selama 6 bulan.",
      experience: [
        {
          id: "exp-1",
          role: "Frontend Developer Intern",
          company: "PT Solusi Teknologi Indonesia",
          period: "Januari 2024 - Juni 2024",
          achievements: [
            "Mengembangkan 8 modul antarmuka web berbasis Next.js dan Tailwind CSS dengan standar aksesibilitas WCAG AA.",
            "Mengoptimalkan loading time website profil perusahaan hingga 35% lebih cepat."
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
      skills: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Git"],
    },
    boundingBoxes: [
      { id: "box-header", type: "header", x: 6, y: 4, width: 88, height: 10, visualWeight: 0.9, title: "Header & Kontak" }
    ],
    fixationPoints: [
      { id: "fp-1", sectionId: "box-header", x: 15, y: 7, intensity: 0.95, durationMs: 850, label: "Nama & Target Posisi", order: 1, category: "hotspot" }
    ],
    overallAttentionScore: 88,
    fPatternScore: 90,
    atsScore: 86,
    recruiterVerdict: "Lolos Pre-Screening RVE Pipeline! Struktur visual dan narasi CV sangat memikat perhatian recruiter target dalam 6 detik pertama.",
    verdictStatus: "interview",
    confidenceScore: 92,
    hrdNotes: "Tata letak judul dan seksi pengalaman tersusun rapi. Keterbacaan pola-F sangat baik.",
    atsCorrelations: [
      { id: "ats-1", keyword: "React.js", category: "Frontend Framework", foundInCv: true, visibilityScore: 95, atsScore: 92, quadrant: "gold", recommendation: "Pertahankan di baris atas ringkasan keahlian." },
      { id: "ats-2", keyword: "Next.js", category: "Web Framework", foundInCv: true, visibilityScore: 90, atsScore: 88, quadrant: "gold", recommendation: "Sangat relevan dengan kualifikasi startup modern." },
      { id: "ats-3", keyword: "TypeScript", category: "Programming Language", foundInCv: true, visibilityScore: 85, atsScore: 85, quadrant: "gold", recommendation: "Tercantum jelas pada daftar kompetensi teknis." }
    ],
    beforeAfterFixes: [
      {
        id: "fix-1",
        section: "Pengalaman Kerja",
        originalText: "Membantu membuat tampilan website perusahaan.",
        suggestedText: "Mengembangkan 8 modul antarmuka web berbasis Next.js dan Tailwind CSS dengan standar aksesibilitas WCAG AA.",
        reason: "Mengubah kalimat pasif menjadi kata kerja aktif terukur dengan metrik kuantitatif.",
        impactBonus: 5
      }
    ],
    predictedInterviewQuestions: [
      {
        id: "q-1",
        question: "Ceritakan pengalaman kamu saat mengoptimalkan waktu loading website hingga 35% lebih cepat?",
        intent: "Menguji pemahaman teknis mengenai performa web.",
        recommendedAnswer: "Jelaskan langkah nyata yang dilakukan, misalnya penerapan lazy loading gambar dan optimalisasi bundle.",
        likelihood: "Tinggi (92%)"
      }
    ],
    aiEvaluations: [
      {
        modelName: "Pemeriksa Keterbacaan HRD (Recruiter Vision)",
        badgeColor: "bg-[#1738D1]",
        score: 90,
        pros: ["Zona pandang 6 detik pertama terbentuk optimal."],
        cons: ["Poin uraian kerja dapat ditambah kata kerja aksi."]
      }
    ],
    consensusScore: 88,
    topAiSummary: {
      overview: "CV kamu memiliki fondasi yang sangat solid untuk meloloskan tahap awal seleksi.",
      dropReasons: ["Tingkatkan variasi kata kerja aksi pada poin pengalaman."],
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
        { id: "check-1", title: "Cantumkan target posisi yang jelas", isDone: true }
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
  targetBasis: "job",
  jobPosition: "Frontend Developer",
  jobCompany: "Traveloka",
  jobDescription: "Membangun antarmuka pemesanan tiket cepat dan responsif dengan React dan Next.js",
  timestamp: Date.now()
};

async function runMobileDeepAudit() {
  console.log('=== MEMULAI AUDIT MENDALAM KHUSUS MOBILE /cv-screener ===');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const viewports = [
    { name: 'iPhone-SE-320', width: 320, height: 568 },
    { name: 'iPhone-Standard-375', width: 375, height: 812 },
    { name: 'Modern-Mobile-390', width: 390, height: 844 },
  ];

  const results = {
    viewportsTested: viewports.map(v => v.name),
    setupViewMobile: {},
    reportViewMobile: {},
    iosAutoZoomHazards: [],
    bottomNavOcclusion: {},
    touchTargetAudit: [],
  };

  try {
    for (const vp of viewports) {
      console.log(`\n--- Pengujian Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: true,
        hasTouch: true,
      });

      const serialized = encodeURIComponent(JSON.stringify(sessionUser));
      await context.addCookies([
        { name: 'employr_user_session', value: serialized, domain: 'localhost', path: '/' },
        { name: 'cuti_user_session', value: serialized, domain: 'localhost', path: '/' },
        { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
      ]);

      await context.addInitScript(({ user, report }) => {
        try {
          localStorage.setItem('employr_user_session', JSON.stringify(user));
          localStorage.setItem('employr_onboarding_completed', 'true');
          localStorage.setItem('employr_active_screener_report', JSON.stringify(report));
        } catch (_) {}
      }, { user: sessionUser, report: mockReport });

      // 1. Audit Setup View
      const setupPage = await context.newPage();
      await setupPage.goto(`${BASE}/cv-screener`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await setupPage.waitForTimeout(2500);

      // Check horizontal overflow
      const setupMetrics = await setupPage.evaluate(() => {
        const clientWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const hasOverflow = scrollWidth > clientWidth;

        // Cari elemen penyebab overflow jika ada
        const overflowingElements = [];
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > clientWidth + 2) {
            overflowingElements.push({
              tag: el.tagName,
              className: el.className,
              rectRight: Math.round(rect.right),
              clientWidth,
            });
          }
        });

        // Cek iOS Auto-Zoom Hazard (input / textarea dengan font-size < 16px)
        const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map((inp) => {
          const style = window.getComputedStyle(inp);
          const fontSize = parseFloat(style.fontSize);
          return {
            tag: inp.tagName,
            type: inp.getAttribute('type') || 'text',
            placeholder: inp.getAttribute('placeholder') || '',
            fontSize: `${fontSize}px`,
            willTriggerIosAutoZoom: fontSize < 16,
          };
        });

        // Cek Bottom Navigation Height & Overlap
        const bottomNav = document.querySelector('nav.fixed.bottom-0, [data-bottom-nav="true"], footer.fixed.bottom-0');
        const bottomNavHeight = bottomNav ? bottomNav.getBoundingClientRect().height : 0;
        const mainContainer = document.querySelector('#main-content-scroll, main, .space-y-4');
        const mainPaddingBottom = mainContainer ? parseFloat(window.getComputedStyle(mainContainer).paddingBottom) : 0;

        // Cek Touch Target Semua Tombol & Link Interaktif
        const interactives = Array.from(document.querySelectorAll('button, a[href], [role="button"], [role="tab"]')).map((el) => {
          const rect = el.getBoundingClientRect();
          const text = (el.textContent || el.getAttribute('aria-label') || '').trim();
          const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
          return {
            tag: el.tagName,
            text: text.slice(0, 45),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            isVisible,
            isSmall: (rect.width < 44 || rect.height < 44) && isVisible,
            padding: window.getComputedStyle(el).padding,
          };
        }).filter(b => b.isVisible);

        return {
          clientWidth,
          scrollWidth,
          hasOverflow,
          overflowCount: overflowingElements.length,
          overflowingElements: overflowingElements.slice(0, 5),
          inputs,
          bottomNavHeight,
          mainPaddingBottom,
          interactives,
          smallCount: interactives.filter(i => i.isSmall).length,
          smallElements: interactives.filter(i => i.isSmall).slice(0, 15),
        };
      });

      // Simpan screenshot fullpage
      const setupShotPath = path.join(OUT_DIR, `setup-${vp.name}.png`);
      await setupPage.screenshot({ path: setupShotPath, fullPage: true });

      // Simpan data
      results.setupViewMobile[vp.name] = setupMetrics;

      // 2. Audit Report View
      const reportPage = await context.newPage();
      await reportPage.goto(`${BASE}/cv-screener/report`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await reportPage.waitForTimeout(2500);

      const reportMetrics = await reportPage.evaluate(() => {
        const clientWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const hasOverflow = scrollWidth > clientWidth;

        // Cek elemen overflow pada report
        const overflowingElements = [];
        document.querySelectorAll('*').forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > clientWidth + 2) {
            overflowingElements.push({
              tag: el.tagName,
              className: el.className?.toString?.() || '',
              rectRight: Math.round(rect.right),
              clientWidth,
            });
          }
        });

        // Cek interaktif pada report
        const interactives = Array.from(document.querySelectorAll('button, a[href], [role="button"], [role="tab"]')).map((el) => {
          const rect = el.getBoundingClientRect();
          const text = (el.textContent || el.getAttribute('aria-label') || '').trim();
          const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
          return {
            tag: el.tagName,
            text: text.slice(0, 45),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            isVisible,
            isSmall: (rect.width < 44 || rect.height < 44) && isVisible,
          };
        }).filter(b => b.isVisible);

        return {
          clientWidth,
          scrollWidth,
          hasOverflow,
          overflowCount: overflowingElements.length,
          overflowingElements: overflowingElements.slice(0, 5),
          smallCount: interactives.filter(i => i.isSmall).length,
          smallElements: interactives.filter(i => i.isSmall).slice(0, 15),
        };
      });

      const reportShotPath = path.join(OUT_DIR, `report-${vp.name}.png`);
      await reportPage.screenshot({ path: reportShotPath, fullPage: true });

      results.reportViewMobile[vp.name] = reportMetrics;

      await context.close();
    }

    fs.writeFileSync(path.join(OUT_DIR, 'mobile-audit-summary.json'), JSON.stringify(results, null, 2));
    console.log('\n=== AUDIT MOBILE SELESAI ===');
    console.log('Hasil disimpan di:', path.join(OUT_DIR, 'mobile-audit-summary.json'));

  } finally {
    await browser.close();
  }
}

runMobileDeepAudit().catch((err) => {
  console.error('Mobile audit error:', err);
  process.exit(1);
});
