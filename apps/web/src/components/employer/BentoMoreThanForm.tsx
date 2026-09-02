import React, { useState } from 'react';

interface BentoItem {
  id: string;
  number: string;
  kicker?: string;
  title: string;
  italicWord?: string;
  description: string;
  colSpan: string;
  bgImage: string;
}

export default function BentoMoreThanForm() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const bentoItems: BentoItem[] = [
    {
      id: 'bento-1',
      number: '01',
      kicker: 'PROFILE VISIBILITY',
      title: 'Stand out from the crowd,',
      italicWord: 'before you even apply.',
      description:
        'Susun headline tajam, ringkasan pengalaman yang menjual, dan kata kunci relevan agar recruiter menemukan profilmu sebelum kamu melamar.',
      colSpan: 'lg:col-span-2 col-span-1',
      bgImage: '/images/image-1.webp',
    },
    {
      id: 'bento-2',
      number: '02',
      kicker: 'ATS & QUALITY AUDIT',
      title: 'ATS-ready,',
      italicWord: 'every time.',
      description:
        'Analisis otomatis untuk action verbs terukur, struktur ATS-friendly, dan skor keterbacaan sebelum dokumen dikirim ke HRD.',
      colSpan: 'lg:col-span-1 col-span-1',
      bgImage: '/images/image-2.webp',
    },
    {
      id: 'bento-3',
      number: '03',
      kicker: 'CONFIDENCE & PREPARATION',
      title: 'Walk into interviews',
      italicWord: 'fully prepared.',
      description:
        'Simulasi tanya-jawab sesuai peran, metode STAR untuk menjawab studi kasus, serta panduan taktis negosiasi gaji.',
      colSpan: 'lg:col-span-1 col-span-1',
      bgImage: '/images/image-3.webp',
    },
    {
      id: 'bento-4',
      number: '04',
      kicker: 'SMART OUTREACH',
      title: 'Automated follow-ups,',
      italicWord: 'zero missed steps.',
      description:
        'Kirim email lamaran dan jadwal follow-up berkala secara otomatis dengan tone sopan dan profesional agar tidak terlewat.',
      colSpan: 'lg:col-span-2 col-span-1',
      bgImage: '/images/image-4.webp',
    },
    {
      id: 'bento-5',
      number: '05',
      kicker: 'ROLE ALIGNMENT',
      title: 'One master profile,',
      italicWord: 'tailored for every role.',
      description:
        'Komparasi langsung antara dua atau lebih lowongan kerja untuk melihat irisan skill, poin perbedaan, dan keyword prioritas yang harus ditonjolkan.',
      colSpan: 'lg:col-span-3 col-span-1',
      bgImage: '/images/hero-section.webp',
    },
  ];

  return (
    <section className="why-bento-section section-space" aria-labelledby="why-employer-title">
      <div className="editorial-frame">
        {/* SECTION EDITORIAL HEADER */}
        <div className="why-bento__top">
          <div className="why-bento__heading">
            <div className="section-label">
              <span>05</span>
              <i></i>
              <span>WHY EMPLOYR</span>
            </div>
            <h2 id="why-employer-title" className="why-bento__title">
              More than an<br />
              <em>online form.</em>
            </h2>
          </div>
          <div className="why-bento__lead-wrap">
            <p className="why-bento__lead">
              Employr memberi visibilitas penuh pada kariermu: dari optimasi LinkedIn, auto mailer, panduan interview, evaluasi CV, hingga komparasi job description.
            </p>
          </div>
        </div>

        {/* BENTO GRID */}
        <div className="why-bento__grid">
          {bentoItems.map((item) => {
            const isHovered = hoveredId === item.id;

            return (
              <div
                key={item.id}
                className={`why-bento__card ${item.colSpan} ${isHovered ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* PHOTO BACKGROUND */}
                <div className="why-bento__bg-wrap">
                  <img
                    src={item.bgImage}
                    alt={item.kicker || item.number}
                    className="why-bento__bg-img"
                    loading="lazy"
                  />
                  <div className="why-bento__shade"></div>
                  <div className="why-bento__radial-glow"></div>
                </div>

                {/* SPOTLIGHT SHEEN ON TOP EDGE */}
                <div className="why-bento__top-sheen"></div>

                {/* CARD CONTENT LAYER */}
                <div className="why-bento__content">
                  {/* TOP ROW: NUMBER ONLY */}
                  <div className="why-bento__card-top">
                    <span className="why-bento__num">{item.number}</span>
                  </div>

                  {/* BOTTOM: KICKER, TITLE & DESCRIPTION */}
                  <div className="why-bento__card-bottom">
                    {item.kicker && <span className="why-bento__kicker">{item.kicker}</span>}
                    <h3 className="why-bento__card-title">
                      {item.title} {item.italicWord && <em>{item.italicWord}</em>}
                    </h3>
                    <p className="why-bento__card-desc">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .why-bento-section {
          background: #f8f7f4;
          color: #111111;
          padding: 120px 0 110px;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .why-bento-section::before {
          content: "";
          position: absolute;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 350px;
          background: radial-gradient(circle, rgba(0, 0, 255, 0.06) 0%, rgba(0, 0, 0, 0) 70%);
          pointer-events: none;
          z-index: 0;
        }

        .why-bento__top {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          align-items: flex-end;
          gap: 6vw;
          margin-bottom: 48px;
          position: relative;
          z-index: 2;
        }

        .why-bento__title {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: clamp(2.6rem, 4.4vw, 4.4rem);
          font-weight: 600;
          letter-spacing: -.085em;
          line-height: .92;
          color: #111111;
          margin: 0;
        }

        .why-bento__title em {
          font-family: "Instrument Serif", Georgia, serif;
          font-style: italic;
          font-weight: 400;
          color: #0000ff;
        }

        .why-bento__lead-wrap {
          padding-bottom: 6px;
        }

        .why-bento__lead {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: 14.5px;
          line-height: 1.6;
          color: #6e6d68;
          margin: 0;
          max-width: 420px;
        }

        /* BENTO GRID */
        .why-bento__grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 20px;
          position: relative;
          z-index: 2;
        }

        @media (min-width: 900px) {
          .why-bento__grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
          }
        }

        /* BENTO CARD */
        .why-bento__card {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          min-height: 320px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .why-bento__card:hover {
          border-color: rgba(0, 0, 0, 0.16);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08), 0 0 30px rgba(0, 0, 255, 0.06);
          transform: translateY(-3px);
        }

        /* PHOTO BACKGROUND */
        .why-bento__bg-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .why-bento__bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease;
          opacity: 0.1;
          filter: saturate(110%) contrast(105%);
        }

        .why-bento__card:hover .why-bento__bg-img {
          transform: scale(1.06);
          opacity: 0.18;
        }

        .why-bento__shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(255, 255, 255, 0.8) 45%,
            rgba(248, 247, 244, 0.98) 100%
          );
        }

        .why-bento__radial-glow {
          position: absolute;
          top: -25%;
          left: 20%;
          width: 240px;
          height: 240px;
          background: radial-gradient(circle, rgba(0, 0, 255, 0.08) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.45s ease;
        }

        .why-bento__card:hover .why-bento__radial-glow {
          opacity: 1;
        }

        /* TOP EDGE SPOTLIGHT SHEEN */
        .why-bento__top-sheen {
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1.5px;
          background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.08) 50%, transparent 100%);
          z-index: 3;
          pointer-events: none;
        }

        /* CONTENT WRAPPER */
        .why-bento__content {
          position: relative;
          z-index: 2;
          padding: 30px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          min-height: 320px;
          box-sizing: border-box;
          gap: 40px;
        }

        .why-bento__card-top {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .why-bento__num {
          font-family: "Manrope", Arial, sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: rgba(0, 0, 0, 0.2);
        }

        /* BOTTOM TEXT */
        .why-bento__card-bottom {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .why-bento__kicker {
          font-family: "Manrope", Arial, sans-serif;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #0000ff;
          text-transform: uppercase;
        }

        .why-bento__card-title {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: clamp(19px, 1.8vw, 24px);
          font-weight: 700;
          letter-spacing: -.06em;
          line-height: 1.15;
          color: #111111;
          margin: 0;
        }

        .why-bento__card-title em {
          font-family: "Instrument Serif", Georgia, serif;
          font-style: italic;
          font-weight: 400;
          color: #0000ff;
        }

        .why-bento__card-desc {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: 13.5px;
          line-height: 1.58;
          color: #6e6d68;
          margin: 0;
          max-width: 540px;
        }

        @media (max-width: 800px) {
          .why-bento-section {
            padding: 85px 0 70px;
          }
          .why-bento__top {
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 32px;
          }
          .why-bento__card {
            min-height: 280px;
          }
          .why-bento__content {
            padding: 22px 20px;
            min-height: 280px;
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}