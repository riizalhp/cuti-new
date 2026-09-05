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
                <img src={logoMark} alt="Employr Logo" title="Employr - Career Operating System" className="brand-symbol" />
              </div>
              <p ref={taglineRef}>Start your career journey today.</p>
            </div>
            <div className="footer__links">
              <div ref={(el) => { colRefs.current[0] = el; }}>
                <b>Product</b>
                <button type="button" onClick={() => handleToast('CV Builder coming soon.')}>CV Builder</button>
                <button type="button" onClick={() => handleToast('Job search coming soon.')}>Find Jobs</button>
                <button type="button" onClick={() => handleToast('CV matching coming soon.')}>Match CV</button>
                <button type="button" onClick={() => handleToast('Career switch coming soon.')}>Switch Careers</button>
              </div>
              <div ref={(el) => { colRefs.current[1] = el; }}>
                <b>Insights</b>
                <button type="button" onClick={() => handleToast('Career guides coming soon.')}>Career Guide</button>
                <button type="button" onClick={() => handleToast('CV tips coming soon.')}>CV Tips</button>
                <button type="button" onClick={() => handleToast('Market insights coming soon.')}>Market Insights</button>
              </div>
              <div ref={(el) => { colRefs.current[2] = el; }}>
                <b>Company</b>
                <button type="button" onClick={() => handleToast('About Employr coming soon.')}>About</button>
                <button type="button" onClick={() => handleToast('Contact details coming soon.')}>Contact</button>
                <button type="button" onClick={() => handleToast('Privacy policy coming soon.')}>Privacy</button>
              </div>
            </div>
          </div>

          <div ref={bottomRef} className="editorial-frame footer__bottom">
            <span>© 2026 Employr · Career Operating System</span>
            <span>YOUR CAREER, BUILT FOR YOU.</span>
            <span>SEMARANG · INDONESIA</span>
          </div>
        </div>
      </footer>
    </>
  );
}
