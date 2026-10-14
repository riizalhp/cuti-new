import os
import sys
import json
from playwright.sync_api import sync_playwright

EDGE_PATHS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]
edge_path = next((p for p in EDGE_PATHS if os.path.exists(p)), None)

TARGET_URL = "http://localhost:3003/sertifikasi"
SCREENSHOT_DIR = r"D:\cuti\apps\portal-loker\screenshots\audit-sertifikasi"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def run():
    print(f"=== Starting Microsoft Auditor & Antislop Verification ===")
    print(f"Target URL: {TARGET_URL}")
    print(f"Edge Path: {edge_path}")

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=edge_path, headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        resp = page.goto(TARGET_URL, wait_until="networkidle", timeout=30000)
        print(f"HTTP Status: {resp.status}")

        desktop_shot = os.path.join(SCREENSHOT_DIR, "desktop-view.png")
        page.screenshot(path=desktop_shot, full_page=True)
        print(f"Saved Desktop Screenshot: {desktop_shot}")

        # 1. Heading Hierarchy Check (MAS 1.3.1)
        headings = page.evaluate("""() => {
            const list = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
                level: parseInt(h.tagName.substring(1)),
                tag: h.tagName,
                text: h.innerText.trim().replace(/\\s+/g, ' ').slice(0, 60)
            }));
            const skips = [];
            let prev = 0;
            for (const h of list) {
                if (prev > 0 && h.level > prev + 1) {
                    skips.push({ from: prev, to: h.level, heading: h.text, tag: h.tag });
                }
                prev = h.level;
            }
            return { total: list.length, list, skips };
        }""")

        print(f"\n--- Heading Hierarchy Audit ---")
        print(f"Total Headings: {headings['total']}")
        print(f"Heading Skips: {len(headings['skips'])}")
        if headings['skips']:
            print("VIOLATIONS:", json.dumps(headings['skips'], indent=2))
        else:
            print("PASSED: 0 Heading skips found. Perfectly sequential!")

        # 2. Em-Dash & En-Dash Check (Antislop R-02)
        dash_violations = page.evaluate("""() => {
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            const violations = [];
            let node;
            while ((node = walker.nextNode())) {
                const parent = node.parentElement;
                if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') continue;
                const text = node.textContent;
                if (text && /[—–]/.test(text)) {
                    violations.push({
                        parentTag: parent.tagName,
                        sample: text.trim().slice(0, 80)
                    });
                }
            }
            return violations;
        }""")

        print(f"\n--- Em-dash & En-dash Audit ---")
        print(f"Dash Violations: {len(dash_violations)}")
        if dash_violations:
            print("VIOLATIONS:", json.dumps(dash_violations[:5], indent=2))
        else:
            print("PASSED: 0 em-dashes / en-dashes found in user-facing text!")

        # 3. ALL CAPS Check (MAS Style Guide)
        all_caps = page.evaluate("""() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const violations = [];
            const allowedAcronyms = ['BNSP', 'HTML', 'HTTP', 'JSON', 'REST', 'CRUD', 'IELTS', 'TOEFL', 'PRO', 'CERT', 'EDU', 'ATS', 'K3', 'ISO', 'IT'];

            for (const el of elements) {
                if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'HEAD', 'META'].includes(el.tagName)) continue;
                const style = window.getComputedStyle(el);
                const text = (el.innerText || '').trim();

                // Check text-transform: uppercase
                if (style.textTransform === 'uppercase' && text.length > 3) {
                    violations.push({
                        tag: el.tagName,
                        className: el.className,
                        text: text.slice(0, 40),
                        reason: 'text-transform: uppercase'
                    });
                }

                // Check raw uppercase strings > 4 chars
                if (text.length > 4 && text === text.toUpperCase() && /^[A-Z\\s,.-]+$/.test(text) && el.children.length === 0) {
                    if (!allowedAcronyms.includes(text)) {
                        violations.push({
                            tag: el.tagName,
                            className: el.className,
                            text: text.slice(0, 40),
                            reason: 'Raw uppercase string'
                        });
                    }
                }
            }
            return violations;
        }""")

        print(f"\n--- ALL CAPS Audit ---")
        print(f"ALL CAPS Violations: {len(all_caps)}")
        if all_caps:
            print("VIOLATIONS:", json.dumps(all_caps[:5], indent=2))
        else:
            print("PASSED: 0 ALL CAPS violations!")

        # 4. Interactive Target Size Check (MAS 2.5.5 / Antislop Layout Mobile)
        tap_targets = page.evaluate("""() => {
            const interactives = Array.from(document.querySelectorAll('a, button, input:not([type="hidden"]), select, textarea'));
            const smallTargets = [];

            for (const el of interactives) {
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) continue;
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') continue;

                // Threshold 43.5px
                const isSub44 = rect.height < 43.5 || rect.width < 43.5;
                if (isSub44) {
                    smallTargets.push({
                        tag: el.tagName,
                        text: (el.innerText || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').trim().slice(0, 40),
                        href: el.getAttribute('href'),
                        w: Math.round(rect.width),
                        h: Math.round(rect.height),
                        className: el.className
                    });
                }
            }
            return { total: interactives.length, small: smallTargets };
        }""")

        print(f"\n--- Interactive Target Size Audit ---")
        print(f"Total Interactive Elements: {tap_targets['total']}")
        print(f"Sub-44px targets: {len(tap_targets['small'])}")
        if tap_targets['small']:
            print("Noticeable sub-44 targets:", json.dumps(tap_targets['small'][:8], indent=2))
        else:
            print("PASSED: All interactive targets meet >= 44x44px!")

        # 5. Modules & Layout Presence Check
        modules = page.evaluate("""() => {
            return {
                h1Title: document.querySelector('h1')?.innerText?.trim(),
                hasPagination: Boolean(document.querySelector('nav[aria-label="Navigasi halaman sertifikasi"]')),
                pageButtonsCount: document.querySelectorAll('nav[aria-label="Navigasi halaman sertifikasi"] a[aria-label^="Buka halaman"]').length,
                hasInFeedAd: Boolean(document.querySelector('.col-span-1.sm\\\\:col-span-2')),
                hasSpotlight: document.body.innerText.includes('Spotlight Pilihan'),
                hasInternalCVAd: document.body.innerText.includes('Review & Bedah CV Standar ATS'),
                hasViralList: document.body.innerText.includes('Artikel Karier Terpopuler'),
                hasSkyscraperAd: document.body.innerText.includes('Mitra Karier Masa Depan') || document.body.innerText.includes('Program 2026'),
                hasCrossArticles: document.body.innerText.includes('Baca Juga Artikel & Tips Karier'),
                hasCrossCerts: document.body.innerText.includes('Rekomendasi Sertifikasi Terkait Lainnya'),
                hasCrossJobs: document.body.innerText.includes('Lowongan Kerja Aktif Terkait'),
                hasCrossCourses: document.body.innerText.includes('Pelatihan & Kursus Rekomendasi'),
                hasCrossEvents: document.body.innerText.includes('Agenda Event & Job Fair Mendatang'),
            };
        }""")

        print(f"\n--- Layout & Modules Audit ---")
        print(json.dumps(modules, indent=2))

        # 6. Test Pagination navigation
        print("\n--- Testing Pagination Click ---")
        page2_btn = page.query_selector('a[aria-label="Buka halaman 2"]')
        if page2_btn:
            page2_btn.click()
            page.wait_for_load_state("networkidle")
            current_url = page.url
            print(f"Navigated to: {current_url}")
            is_page_2 = "page=2" in current_url
            print(f"Pagination page 2 test: {'SUCCESS' if is_page_2 else 'FAILED'}")
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "desktop-page-2.png"), full_page=True)

        # 7. Mobile Viewport Check
        print("\n--- Testing Mobile Viewport (375x812) ---")
        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(TARGET_URL, wait_until="networkidle")
        mobile_shot = os.path.join(SCREENSHOT_DIR, "mobile-view.png")
        page.screenshot(path=mobile_shot, full_page=True)
        print(f"Saved Mobile Screenshot: {mobile_shot}")

        browser.close()
        print("\n=== Audit Completed Successfully! ===")

if __name__ == "__main__":
    run()
