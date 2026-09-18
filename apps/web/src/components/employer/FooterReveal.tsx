import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface FooterRevealProps {
  logoMark: string;
}

export default function FooterReveal({ logoMark }: FooterRevealProps) {
  const footerRef = useRef<HTMLElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLImageElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleToast = (msg: string) => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: msg }));
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const spacer = spacerRef.current;
    if (!spacer) return;

    const ctx = gsap.context(() => {
      // Main scroll scrub timeline: handles bidirectional Fade In & Fade Out on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: spacer,
          start: 'top 98%',
          end: 'bottom 100%',
          scrub: 0.7,
        },
      });

      // 1. Giant watermark background logo
      if (watermarkRef.current) {
        tl.fromTo(
          watermarkRef.current,
          { opacity: 0, scale: 0.92, y: 40 },
          {
            opacity: 0.07,
            scale: 1,
            y: 0,
            ease: 'none',
          },
          0
        );
      }

      // 2. Brand mark & logo
      if (brandRef.current) {
        tl.fromTo(
          brandRef.current,
          { opacity: 0, y: 32, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: 'none',
          },
          0.1
        );
      }

      // 3. Tagline text
      if (taglineRef.current) {
        tl.fromTo(
          taglineRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
          },
          0.2
        );
      }

      // 4. Link navigation columns (staggered)
      const validCols = colRefs.current.filter(Boolean);
      if (validCols.length > 0) {
        tl.fromTo(
          validCols,
          { opacity: 0, y: 30, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            stagger: 0.08,
            ease: 'none',
          },
          0.25
        );
      }

      // 5. Bottom bar (copyright, slogan, city)
      if (bottomRef.current) {
        const bottomItems = Array.from(bottomRef.current.children);
        tl.fromTo(
          bottomItems,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            ease: 'none',
          },
          0.45
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Creates the scroll distance that exposes the fixed footer behind <main>. */}
      <div ref={spacerRef} className="footer-reveal-spacer" aria-hidden="true" />

      <footer ref={footerRef} className="footer-reveal-fixed" aria-label="Footer navigation">
        {/* Giant decorative Employr wordmark (background watermark) */}
        <img
          ref={watermarkRef}
          src="/logo.svg"
          alt="Employr Logo"
          title="Employr Watermark Logo"
          aria-hidden="true"
          className="footer-reveal-watermark"
        />
        <div className="footer-reveal-inner">
          <div className="editorial-frame footer__top">
            <div>
              <div ref={brandRef} className="brand-mark">
                <img src={logoMark} alt="Logo Employr" title="Employr - Persiapan Karier Menuju Pekerjaan Impian" className="brand-symbol" />
              </div>
              <p ref={taglineRef}>Mulai persiapan kariermu hari ini.</p>
            </div>
            <div className="footer__links">
              <div ref={(el) => { colRefs.current[0] = el; }}>
                <b>Produk</b>
                <button type="button" onClick={() => handleToast('Fitur CV Builder segera hadir.')}>CV Builder</button>
                <button type="button" onClick={() => handleToast('Pencarian loker segera hadir.')}>Cari Loker</button>
                <button type="button" onClick={() => handleToast('Pencocokan CV segera hadir.')}>Cocokkan CV</button>
                <button type="button" onClick={() => handleToast('Panduan pindah karier segera hadir.')}>Pindah Karier</button>
              </div>
              <div ref={(el) => { colRefs.current[1] = el; }}>
                <b>Panduan</b>
                <button type="button" onClick={() => handleToast('Panduan karier segera hadir.')}>Panduan Karier</button>
                <button type="button" onClick={() => handleToast('Tips CV segera hadir.')}>Tips CV</button>
                <button type="button" onClick={() => handleToast('Tren dunia kerja segera hadir.')}>Tren Kerja</button>
              </div>
              <div ref={(el) => { colRefs.current[2] = el; }}>
                <b>Perusahaan</b>
                <button type="button" onClick={() => handleToast('Informasi tentang kami segera hadir.')}>Tentang Kami</button>
                <a href="mailto:help.employr@outlook.com">Email CS</a>
                <a href="https://www.threads.net/@employr.id" target="_blank" rel="noopener noreferrer">Threads @employr.id</a>
                <a href="https://www.threads.net/@riizalhp" target="_blank" rel="noopener noreferrer">DM @riizalhp</a>
                <a href="/kebijakan-privasi">Privasi</a>
              </div>
            </div>
          </div>

          <div ref={bottomRef} className="editorial-frame footer__bottom">
            <span>© 2026 Employr</span>
            <span>KARIERMU, PILIHANMU.</span>
            <span>SEMARANG · INDONESIA</span>
          </div>
        </div>
      </footer>
    </>
  );
}
