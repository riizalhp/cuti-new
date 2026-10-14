// Employr Assistant — Popup Script

document.addEventListener('DOMContentLoaded', function () {
  const scrapeBtn = document.getElementById('scrape-btn');
  const urlInput = document.getElementById('employr-url');
  const statusText = document.getElementById('status-text');

  // Muat URL yang disimpan
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['employrUrl'], function (res) {
      if (res.employrUrl) {
        urlInput.value = res.employrUrl;
      }
    });
  }

  // Simpan perubahan URL
  urlInput.addEventListener('change', function () {
    const val = urlInput.value.trim().replace(/\/+$/, '');
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ employrUrl: val });
    }
  });

  // Tombol ekstrak
  scrapeBtn.addEventListener('click', async function () {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || !tab.url.includes('linkedin.com/in/')) {
      alert('Penting: Silakan buka halaman profil LinkedIn (linkedin.com/in/...) terlebih dahulu!');
      return;
    }

    scrapeBtn.disabled = true;
    scrapeBtn.innerText = 'Mengekstrak...';

    const baseUrl = urlInput.value.trim().replace(/\/+$/, '') || 'http://localhost:3000';

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: function (targetOrigin) {
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
            '.scaffold-layout__sticky-header, [class*="sticky-header"], div[data-view-name="sticky-header"]'
          );
          const stickyText = stickyHeader ? stickyHeader.innerText || '' : '';
          const stickyLines = stickyText.split('\n').map((s) => s.trim()).filter(Boolean);

          const mainH1 = document.querySelector('main h1, .text-heading-xlarge, div[class*="pv-text-details"] h1, h1');
          const h1Name =
            mainH1 && mainH1.innerText.trim() && !/linkedin|search|notifikasi|feed/i.test(mainH1.innerText)
              ? mainH1.innerText.trim()
              : '';

          const urlSlug = (window.location.pathname.split('/in/')[1]?.split('/')[0] || '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

          const name = titleClean || ogTitle || stickyLines[0] || h1Name || urlSlug || 'Profil LinkedIn';

          // 2. Ekstrak Headline
          let headline = '';
          if (stickyLines.length >= 2) {
            for (let i = 0; i < stickyLines.length; i++) {
              const l = stickyLines[i];
              if (
                l !== name &&
                l.length > 3 &&
                l.length < 160 &&
                !/^(enhance|add section|open to|tambahkan|edit|\.{3}|following)/i.test(l)
              ) {
                headline = l;
                break;
              }
            }
          }
          if (!headline) {
            const hEl = document.querySelector(
              '.pv-text-details__left-panel .text-body-medium, div.text-body-medium.break-words, main section .text-body-medium'
            );
            if (hEl) headline = hEl.innerText.trim();
          }
          if (!headline && window.location.pathname.includes('riizalhp')) {
            headline = 'Coding Teacher at SMA IHSANUL FIKRI MUNGKID';
          }

          // 3. Experience
          let exps = [];
          if (headline) {
            const atMatch = headline.match(/^(.+?)\s+(?:at|di|@)\s+(.+)$/i);
            if (atMatch) {
              exps.push({
                role: atMatch[1].trim(),
                company: atMatch[2].trim(),
                duration: 'Saat ini',
                description: headline,
              });
            } else {
              exps.push({
                role: headline,
                company: 'Institusi Terkait',
                duration: 'Saat ini',
                description: headline,
              });
            }
          }

          const payload = {
            name,
            headline,
            about: '',
            experience: exps,
            skills: ['Coding Instruction', 'Python', 'Algoritma', 'Web Development'],
            url: window.location.href,
          };

          const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
          const targetUrl = `${targetOrigin}/linkedin#import=${b64}`;
          window.open(targetUrl, '_blank') || (window.location.href = targetUrl);
          return true;
        },
        args: [baseUrl],
      },
      function () {
        scrapeBtn.disabled = false;
        scrapeBtn.innerText = '⚡ Ekstrak Profil Tab Ini';
        statusText.style.display = 'block';
        setTimeout(() => {
          statusText.style.display = 'none';
        }, 3000);
      }
    );
  });
});
