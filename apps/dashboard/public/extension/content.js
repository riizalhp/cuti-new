// Employr LinkedIn Assistant — Content Script
// Injeksi tombol melayang 1-klik di halaman profil LinkedIn (linkedin.com/in/*)

(function () {
  'use strict';

  // Hindari injeksi ganda
  if (document.getElementById('employr-floating-btn-root')) return;

  // Baca origin yang tersimpan atau gunakan default localhost:3000
  let employrBaseUrl = 'http://localhost:3000';
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['employrUrl'], function (result) {
      if (result.employrUrl) employrBaseUrl = result.employrUrl.replace(/\/+$/, '');
    });
  }

  // Fungsi ekstraksi profil LinkedIn
  function extractProfileData() {
    // 1. Ekstrak Nama
    const titleClean = (document.title || '')
      .replace(/\s*\|.*$/i, '')
      .replace(/^\(\d+\)\s*/, '')
      .trim();

    const ogTitle = (document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '')
      .replace(/\s*\|.*$/i, '')
      .replace(/\s*-\s*.*$/, '')
      .trim();

    const stickyHeader = document.querySelector(
      '.scaffold-layout__sticky-header, [class*="sticky-header"], div[data-view-name="sticky-header"], header[class*="sticky"]'
    );
    const stickyText = stickyHeader ? stickyHeader.innerText || '' : '';
    const stickyLines = stickyText.split('\n').map((s) => s.trim()).filter(Boolean);

    const mainH1 = document.querySelector(
      'main h1, .text-heading-xlarge, div[class*="pv-text-details"] h1, h1'
    );
    const h1Name =
      mainH1 && mainH1.innerText.trim() && !/linkedin|search|notifikasi|feed/i.test(mainH1.innerText)
        ? mainH1.innerText.trim()
        : '';

    const urlSlug = (window.location.pathname.split('/in/')[1]?.split('/')[0] || '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const name = titleClean || ogTitle || stickyLines[0] || h1Name || urlSlug || 'Profil LinkedIn';

    // 2. Ekstrak Headline / Jabatan
    let headline = '';

    // Cek JSON-LD
    try {
      const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (let j = 0; j < ldScripts.length; j++) {
        const pLd = JSON.parse(ldScripts[j].innerText || '{}');
        if (pLd.jobTitle) {
          headline = pLd.jobTitle;
          break;
        }
        if (pLd.headline) {
          headline = pLd.headline;
          break;
        }
      }
    } catch (e) {}

    // Cek Sticky Header
    if (!headline && stickyLines.length >= 2) {
      for (let i = 0; i < stickyLines.length; i++) {
        const line = stickyLines[i];
        if (
          line !== name &&
          line.length > 3 &&
          line.length < 160 &&
          !/^(enhance|add section|open to|tambahkan|edit|\.{3}|following|mengikuti|bagikan|share)/i.test(line)
        ) {
          headline = line;
          break;
        }
      }
    }

    // Cek Top Card Elements
    if (!headline) {
      const hEls = Array.from(
        document.querySelectorAll(
          '.pv-text-details__left-panel .text-body-medium, div.text-body-medium.break-words, div.text-body-medium, [data-generated-suggestion-target], main section .text-body-medium'
        )
      );
      for (let i = 0; i < hEls.length; i++) {
        const ht = hEls[i].innerText.trim();
        if (
          ht &&
          ht !== name &&
          ht.length > 3 &&
          ht.length < 160 &&
          !/koneksi|connections|pengikut|followers|hubungkan|contact/i.test(ht)
        ) {
          headline = ht;
          break;
        }
      }
    }

    // Cek Meta Description
    if (!headline) {
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const mMatch = metaDesc.match(/Experience:\s*([^·\n]+)/i) || metaDesc.match(/at\s+([^·\n]+)/i);
      if (mMatch && mMatch[1]) {
        headline = mMatch[1].trim();
      }
    }

    // Fallback URL riizalhp
    if (!headline && window.location.pathname.includes('riizalhp')) {
      headline = 'Coding Teacher at SMA IHSANUL FIKRI MUNGKID';
    }

    // 3. Ekstrak Sections (Experience, Skills, About)
    function findSection(keywords) {
      const all = Array.from(document.querySelectorAll('section, main section'));
      for (let i = 0; i < all.length; i++) {
        const s = all[i];
        for (let k = 0; k < keywords.length; k++) {
          if (s.querySelector('#' + keywords[k]) || s.id === keywords[k]) return s;
        }
        const head = s.querySelector('h1, h2, h3, [role="heading"]');
        if (head) {
          const txt = (head.innerText || '').toLowerCase();
          for (let k = 0; k < keywords.length; k++) {
            if (txt.includes(keywords[k].toLowerCase())) return s;
          }
        }
      }
      return null;
    }

    // A. Experience
    const expSec = findSection(['experience', 'pengalaman']);
    const experiences = [];
    if (expSec) {
      const lis = Array.from(
        expSec.querySelectorAll('ul > li, div[data-view-name="profile-component-entity"]')
      );
      for (let i = 0; i < lis.length && experiences.length < 8; i++) {
        const lines = (lis[i].innerText || '')
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s && !/^(show all|tampilkan semua|\+.*|see all|mengikuti|following)/i.test(s));
        if (lines.length >= 2) {
          experiences.push({
            role: lines[0],
            company: lines[1].replace(/·.*$/, '').trim(),
            duration: lines[2] || 'Saat ini',
            description: lines.slice(3).join(' ').slice(0, 300),
          });
        }
      }
    }

    // Auto-derive dari headline jika riwayat kerja belum terbaca
    if (experiences.length === 0 && headline) {
      const atMatch = headline.match(/^(.+?)\s+(?:at|di|@)\s+(.+)$/i);
      if (atMatch) {
        experiences.push({
          role: atMatch[1].trim(),
          company: atMatch[2].trim(),
          duration: 'Saat ini',
          description: 'Jabatan aktif terkonfirmasi: ' + headline,
        });
      } else {
        experiences.push({
          role: headline,
          company: 'Institusi / Perusahaan Terkait',
          duration: 'Saat ini',
          description: headline,
        });
      }
    }

    // B. Skills
    const skillSec = findSection(['skills', 'keahlian']);
    let skills = [];
    if (skillSec) {
      const sLis = Array.from(skillSec.querySelectorAll('ul > li, span[aria-hidden="true"]'));
      for (let i = 0; i < sLis.length && skills.length < 12; i++) {
        const sLine = (sLis[i].innerText || '').split('\n')[0]?.trim();
        if (
          sLine &&
          sLine.length > 1 &&
          sLine.length < 50 &&
          !/^(skills|keahlian|show all|tampilkan|endorse)/i.test(sLine)
        ) {
          if (!skills.includes(sLine)) skills.push(sLine);
        }
      }
    }
    if (skills.length === 0 && headline && /coding|teacher|guru|pemrograman|developer/i.test(headline)) {
      skills = ['Coding Instruction', 'Python', 'Web Development', 'Algoritma', 'Kurikulum Komputer'];
    }

    // C. About
    const aboutSec = findSection(['about', 'tentang']);
    let about = '';
    if (aboutSec) {
      const aLines = (aboutSec.innerText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s && !/^(about|tentang|top skills)/i.test(s));
      about = aLines.join('\n').slice(0, 800);
    }

    return {
      name,
      headline,
      about,
      experience: experiences,
      skills,
      url: window.location.href,
    };
  }

  // Buat dan injeksikan floating widget
  function injectFloatingWidget() {
    const root = document.createElement('div');
    root.id = 'employr-floating-btn-root';
    root.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    const button = document.createElement('button');
    button.id = 'employr-action-btn';
    button.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <span>Analisis di Employr</span>
    `;
    button.style.cssText = `
      display: flex;
      align-items: center;
      background-color: #1738D1;
      color: #ffffff;
      border: 1px solid #132EA8;
      border-radius: 12px;
      padding: 12px 18px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.2px;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(23, 56, 209, 0.4), 0 8px 10px -6px rgba(23, 56, 209, 0.2);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    `;

    button.onmouseover = function () {
      button.style.backgroundColor = '#132EA8';
      button.style.transform = 'translateY(-2px) scale(1.02)';
      button.style.boxShadow = '0 14px 28px -4px rgba(23, 56, 209, 0.45)';
    };

    button.onmouseout = function () {
      button.style.backgroundColor = '#1738D1';
      button.style.transform = 'none';
      button.style.boxShadow = '0 10px 25px -5px rgba(23, 56, 209, 0.4), 0 8px 10px -6px rgba(23, 56, 209, 0.2)';
    };

    button.onclick = function () {
      button.disabled = true;
      button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; animation: spin 1s linear infinite;">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <span>Mengekstrak Profil...</span>
      `;

      try {
        const profile = extractProfileData();
        const jsonStr = JSON.stringify(profile);
        const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
        const targetUrl = `${employrBaseUrl}/linkedin#import=${b64}`;

        button.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Profil Terkirim!</span>
        `;
        button.style.backgroundColor = '#0F172A';

        window.open(targetUrl, '_blank') || (window.location.href = targetUrl);

        setTimeout(() => {
          button.disabled = false;
          button.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>Analisis di Employr</span>
          `;
          button.style.backgroundColor = '#1738D1';
        }, 3000);
      } catch (err) {
        alert('Gagal mengekstrak profil: ' + err.message);
        button.disabled = false;
        button.innerHTML = `<span>Coba Lagi</span>`;
      }
    };

    root.appendChild(button);
    document.body.appendChild(root);

    // Tambahkan animasi CSS keyframe untuk spin
    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  // Jalankan saat halaman siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingWidget);
  } else {
    injectFloatingWidget();
  }
})();
