import { chromium } from 'playwright-core';
import fs from 'fs';

async function check() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const serialized = encodeURIComponent(JSON.stringify({ id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37', name: 'Budi Santoso', email: 'budi.santoso@gmail.com', role: 'MEMBER', onboarded: true }));
  await context.addCookies([
    { name: 'employr_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'cuti_user_session', value: serialized, domain: 'localhost', path: '/' },
    { name: 'employr_auth_session', value: 'sess_mock_token_audit', domain: 'localhost', path: '/' },
  ]);

  const raw = fs.readFileSync('D:\\cuti\\apps\\dashboard\\scripts\\audit-cv-screener-report.mjs', 'utf8');
  // inject mock report from audit-cv-screener-report.mjs
  await context.addInitScript(() => {
    const mock = {
      rveReport: {
        parsedData: { id: "cv-budi-1", candidateName: "Budi Santoso", roleTitle: "Frontend Developer", experience: [], education: [], skills: ["React.js", "Next.js"] },
        overallAttentionScore: 88, fPatternScore: 90, atsScore: 86,
        verdictStatus: "interview", confidenceScore: 92, consensusScore: 88,
        topAiSummary: { overview: "CV kamu sangat solid.", dropReasons: ["Tingkatkan metrik."], estimatedProbability: 88 },
        atsCorrelations: [{ id: "ats-1", keyword: "React.js", foundInCv: true, quadrant: "gold" }],
        beforeAfterFixes: [{ id: "fix-1", section: "Pengalaman", originalText: "A", suggestedText: "B", reason: "C", impactBonus: 5 }],
        predictedInterviewQuestions: [{ id: "q-1", question: "Ceritakan proyekmu", intent: "Teknis", recommendedAnswer: "Jawaban", likelihood: "Tinggi" }],
        aiEvaluations: [{ modelName: "Pemeriksa Visual HRD", score: 90, pros: ["Bagus"], cons: ["Poin 1"] }],
      },
      selectedPersonaId: "startup", targetRole: "Frontend Developer", targetLevel: "Entry", cvSourceMode: "saved", selectedCvId: "cv-budi-1", appliedFixes: []
    };
    localStorage.setItem('employr_user_session', JSON.stringify({ id: 'a3e09016-eaa6-4394-a939-ee8679c2dc37', name: 'Budi Santoso', email: 'budi.santoso@gmail.com', role: 'MEMBER', onboarded: true }));
    localStorage.setItem('employr_onboarding_completed', 'true');
    localStorage.setItem('employr_active_screener_report', JSON.stringify(mock));
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000/cv-screener/report');
  await page.waitForTimeout(2500);

  const data = await page.evaluate(() => {
    const main = document.querySelector('#main-content-scroll') || document.body;
    const elements = Array.from(main.querySelectorAll('button, a[href], [role="button"], [role="tab"]'));
    return elements.map(el => {
      const rect = el.getBoundingClientRect();
      const text = (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
      return {
        tag: el.tagName,
        text,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        isVisible,
        isSmall: (rect.width < 44 || rect.height < 44) && isVisible,
      };
    }).filter(b => b.isVisible);
  });

  console.log('Total interactive elements in populated report:', data.length);
  const smalls = data.filter(d => d.isSmall);
  console.log('Small elements count (< 44px) in populated report:', smalls.length);
  smalls.forEach(s => {
    console.log(`- ${s.text || '[icon]'} (${s.width}x${s.height}px)`);
  });

  await browser.close();
}

check().catch(console.error);
