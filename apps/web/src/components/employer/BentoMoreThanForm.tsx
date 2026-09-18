import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FeatureItem {
  id: string;
  number: string;
  tag: string;
  title: string;
  italicWord: string;
  lead: string;
  description: string;
  desktopImg: string;
  mobileImg: string;
}

const features: FeatureItem[] = [
  {
    id: 'generate-cv',
    number: '01',
    tag: 'SUSUN CV',
    title: 'Buat draf CV sepuasnya,',
    italicWord: 'kapan pun kamu butuh.',
    lead: 'Format standar ATS yang rapi, mudah dibaca sistem seleksi maupun HR.',
    description:
      'Buat variasi CV berbeda untuk tiap bidang pekerjaan tanpa batasan.',
    desktopImg: '/images/dekstop-cv.webp',
    mobileImg: '/images/mobile-cv.webp',
  },
  {
    id: 'eval-cv',
    number: '02',
    tag: 'EVALUASI CV',
    title: 'Cek kelengkapan berkas,',
    italicWord: 'temukan bagian yang kurang.',
    lead: 'Masukan praktis untuk memastikan struktur dan kejelasan kalimat sebelum dikirim.',
    description:
      'Periksa bobot kalimat dan susunan bagian penting agar peluang interview makin besar.',
    desktopImg: '/images/dekstop-eval.webp',
    mobileImg: '/images/mobile-eval.webp',
  },
  {
    id: 'job-matcher',
    number: '03',
    tag: 'PENCOCOKAN LOKER',
    title: 'Cocokkan isi CV',
    italicWord: 'dengan kriteria lowongan.',
    lead: 'Lihat kualifikasi yang belum tercantum dan sesuaikan istilah yang dicari rekruter.',
    description:
      'Ketahui kata kunci penting posisi incaranmu agar berkas lamaran tidak terlewat.',
    desktopImg: '/images/dekstop-matcher.webp',
    mobileImg: '/images/mobile-matcher.webp',
  },
  {
    id: 'kanban-tracker',
    number: '04',
    tag: 'PANTAU LAMARAN',
    title: 'Catat setiap proses melamar,',
    italicWord: 'tanpa ada yang terlewat.',
    lead: 'Alur visual dari tahap berkas terkirim, tes, interview, hingga tawaran kerja.',
    description:
      'Kelola seluruh riwayat lamaran kerja dalam satu papan pemantau yang rapi.',
    desktopImg: '/images/dekstop-kanban.webp',
    mobileImg: '/images/mobile-kanban.webp',
  },
  {
    id: 'linkedin-opt',
    number: '05',
    tag: 'PROFIL LINKEDIN',
    title: 'Rapikan profil LinkedIn,',
    italicWord: 'mudah ditemukan rekruter.',
    lead: 'Susun headline jelas, ringkasan pengalaman menarik, dan keahlian utama.',
    description:
      'Bantu profilmu terlihat meyakinkan saat rekruter mencari kandidat baru.',
    desktopImg: '/images/dekstop-linkedin.webp',
    mobileImg: '/images/mobile-linkedin.webp',
  },
  {
    id: 'auto-mailer',
    number: '06',
    tag: 'DRAF EMAIL LAMARAN',
    title: 'Susun pesan lamaran sopan,',
    italicWord: 'siap kirim ke tim HR.',
    lead: 'Format cover letter dan email pembuka yang santun serta enak dibaca.',
    description:
      'Siapkan draf pesan berkala untuk menanyakan kabar proses seleksi secara profesional.',
    desktopImg: '/images/dekstop-mailer.webp',
    mobileImg: '/images/mobile-mailer.webp',
  },
  {
    id: 'manage-cv',
    number: '07',
    tag: 'ARSIP VERSI CV',
    title: 'Simpan semua draf,',
    italicWord: 'siap kirim kapan saja.',
    lead: 'Satu profil induk yang bisa disesuaikan ke berbagai variasi berkas.',
    description:
      'Kelompokkan draf CV untuk desain, admin, atau marketing di satu tempat teratur.',
    desktopImg: '/images/dekstop-manage.webp',
    mobileImg: '/images/mobile-manage.webp',
  },
];

export default function BentoMoreThanForm() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const frameRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  // Preload all desktop & mobile images so swapping is instant and calibrate trigger offsets
  useEffect(() => {
    const srcs = features.flatMap((f) => [f.desktopImg, f.mobileImg]);
    let loaded = 0;
    srcs.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === srcs.length) {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        }
      };
      img.src = src;
    });
  }, []);

  // Scroll-driven storytelling: pin section cleanly at comfortable top position, scrub through features
  useEffect(() => {
    const frame = frameRef.current;
    const story = storyRef.current;
    if (!frame || !story) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setActiveIndex(0);
      return;
    }

    const getStartPos = () => {
      if (window.innerWidth <= 900) {
        return 'top 16px';
      }
      const header = document.querySelector('.site-header') as HTMLElement | null;
      return `top ${header ? header.offsetHeight : 84}px`;
    };

    const STEP_PX = window.innerWidth <= 900 ? 120 : 130;
    const totalDistance = (features.length - 1) * STEP_PX;

    const st = ScrollTrigger.create({
      trigger: frame,
      pin: story,
      start: () => getStartPos(),
      end: () => `+=${totalDistance}`,
      pinSpacing: true,
      anticipatePin: 1,
      refreshPriority: 1,
      scrub: 0.2,
      snap: {
        snapTo: 1 / (features.length - 1),
        duration: { min: 0.18, max: 0.32 },
        ease: 'power2.out',
      },
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const rawIdx = Math.round(self.progress * (features.length - 1));
        const idx = Math.min(features.length - 1, Math.max(0, rawIdx));
        if (idx !== indexRef.current) {
          const dir = self.direction === -1 || idx < indexRef.current ? 'up' : 'down';
          indexRef.current = idx;
          setDirection(dir);
          setActiveIndex(idx);
        }
      },
    });

    const handleLoad = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    window.addEventListener('load', handleLoad);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
    }

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 280);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener('load', handleLoad);
      st.kill();
    };
  }, []);

  const activeFeature = features[activeIndex];

  return (
    <section ref={frameRef} className="scroll-story-frame" aria-label="Kemampuan fitur Employr">
      <div
        ref={storyRef}
        className="scroll-story"
      >
        {/* FULL-BLEED CINEMATIC MEDIA - CLEAN WITHOUT BLACK OVERLAYS */}
        <div
          className={`scroll-story__media scroll-story__media--${direction}`}
          key={`media-${activeFeature.id}`}
        >
          <img
            src={activeFeature.desktopImg}
            alt={`${activeFeature.tag} - Tampilan desktop`}
            title={`${activeFeature.tag} - Tampilan desktop`}
            className="scroll-story__img scroll-story__img--desktop"
            draggable={false}
          />
          <img
            src={activeFeature.mobileImg}
            alt={`${activeFeature.tag} - Tampilan mobile`}
            title={`${activeFeature.tag} - Tampilan mobile`}
            className="scroll-story__img scroll-story__img--mobile"
            draggable={false}
          />
        </div>

        {/* READABILITY GRADIENT OVERLAY */}
        <div className="scroll-story__overlay"></div>

        {/* STORY CONTENT DIRECTLY OVER BACKGROUND */}
        <div
          className={`scroll-story__content scroll-story__content--${direction}`}
          key={`story-${activeFeature.id}`}
        >
          <div className="scroll-story__head">
            <span className="scroll-story__tag">{activeFeature.tag}</span>
            <span className="scroll-story__num">{activeFeature.number} / 07</span>
          </div>
          <h3 className="scroll-story__title">
            {activeFeature.title} <em>{activeFeature.italicWord}</em>
          </h3>
          <p className="scroll-story__lead">{activeFeature.lead}</p>
        </div>
      </div>

      <style>{`
        /* FRAMED CONTAINER (matches hero-frame-container: paper gutter + rounded card) */
        .scroll-story-frame {
          position: relative;
          max-width: 1680px;
          margin: 0 auto;
          padding: 10px clamp(12px, 2.5vw, 36px) 28px;
          width: 100%;
          box-sizing: border-box;
          background: var(--paper);
        }

        /* Match hero-card dimensions identically */
        .scroll-story {
          position: relative;
          width: 100%;
          min-height: clamp(520px, 72vh, 840px);
          max-height: calc(100vh - 96px);
          height: auto;
          overflow: hidden;
          background: #0d0d0f;
          color: #fff;
          border-radius: clamp(20px, 2.2vw, 32px);
          border: 1px solid rgba(16, 16, 16, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        @media (max-width: 700px) {
          .scroll-story {
            height: clamp(540px, calc(100vh - 84px), 740px);
            min-height: 540px;
            max-height: calc(100vh - 84px);
          }
        }

        /* FULL-BLEED MEDIA WITH DIRECTIONAL SWIPE */
        .scroll-story__media {
          position: absolute;
          inset: 0;
        }

        .scroll-story__media--down {
          animation: swipeUpMedia .55s cubic-bezier(.16,1,.3,1) both;
        }

        .scroll-story__media--up {
          animation: swipeDownMedia .55s cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes swipeUpMedia {
          from { opacity: 0; transform: translateY(24px) scale(1.02); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes swipeDownMedia {
          from { opacity: 0; transform: translateY(-24px) scale(1.02); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .scroll-story__img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(106%) contrast(104%);
          user-select: none;
          -webkit-user-drag: none;
        }

        .scroll-story__img--desktop { display: block; }
        .scroll-story__img--mobile { display: none; }


        /* STORY CONTENT DIRECTLY OVER BACKGROUND WITH DIRECTIONAL SWIPE */
        .scroll-story__content {
          position: absolute;
          left: clamp(28px, 4.5vw, 72px);
          bottom: clamp(32px, 5vh, 64px);
          z-index: 3;
          max-width: 440px;
          pointer-events: none;
        }

        .scroll-story__content--down {
          animation: swipeUpText .48s cubic-bezier(.16,1,.3,1) both;
        }

        .scroll-story__content--up {
          animation: swipeDownText .48s cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes swipeUpText {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes swipeDownText {
          from { opacity: 0; transform: translateY(-32px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .scroll-story__head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .scroll-story__tag {
          font-family: "Manrope", Arial, sans-serif;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: .16em;
          color: #93c5fd;
          text-transform: uppercase;
          text-shadow: 0 1px 4px rgba(0,0,0,.9);
        }

        .scroll-story__num {
          font-family: "Manrope", Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .08em;
          color: rgba(255,255,255,.55);
          text-shadow: 0 1px 4px rgba(0,0,0,.9);
        }

        .scroll-story__title {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: clamp(18px, 1.9vw, 24px);
          font-weight: 700;
          letter-spacing: -.05em;
          line-height: 1.15;
          color: #fff;
          margin: 0 0 8px;
          text-shadow: 0 2px 8px rgba(0,0,0,.85), 0 1px 3px rgba(0,0,0,.95);
        }

        .scroll-story__title em {
          font-family: "Instrument Serif", Georgia, serif;
          font-style: italic;
          font-weight: 400;
          color: #93c5fd;
          letter-spacing: -.01em;
        }

        .scroll-story__lead {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: 12.5px;
          line-height: 1.5;
          color: rgba(255,255,255,.92);
          margin: 0;
          font-weight: 500;
          text-shadow: 0 1px 5px rgba(0,0,0,.85);
        }

        /* Readability gradient for text */
        .scroll-story__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(13, 13, 15, 0.05) 0%, rgba(13, 13, 15, 0.25) 45%, rgba(13, 13, 15, 0.82) 75%, rgba(13, 13, 15, 0.96) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .scroll-story__mobile-controls {
          display: none;
        }

        /* MOBILE ADAPTATION */
        @media (max-width: 900px) {
          .scroll-story-frame {
            padding: 8px 10px 10px !important;
          }

          .scroll-story {
            height: calc(100vh - 32px) !important;
            height: calc(100dvh - 32px) !important;
            min-height: 580px !important;
            max-height: calc(100dvh - 32px) !important;
            border-radius: 20px !important;
          }

          .scroll-story__img--desktop { display: none; }
          .scroll-story__img--mobile { display: block; object-position: center top; }

          .scroll-story__content {
            left: 20px;
            right: 20px;
            bottom: 24px;
            max-width: none;
          }

          .scroll-story__title { font-size: 18px; line-height: 1.2; margin: 0 0 6px; }
          .scroll-story__lead { font-size: 12px; line-height: 1.45; }
        }
      `}</style>
    </section>
  );
}
