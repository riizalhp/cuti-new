import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CardData {
  id: number;
  number: string;
  title: string;
  italicWord?: string;
  description: string;
  bgImage: string;
}

const cards: CardData[] = [
  {
    id: 1,
    number: '01',
    title: 'One data source.',
    italicWord: 'Many directions.',
    description:
      'Fill in your profile once, then create as many CV versions as you need for every role you target.',
    bgImage: '/images/image-1.webp',
  },
  {
    id: 2,
    number: '02',
    title: 'No need to',
    italicWord: 'start from scratch.',
    description:
      'Duplicate your favorite draft and tweak it for each target role in seconds.',
    bgImage: '/images/image-2.webp',
  },
  {
    id: 3,
    number: '03',
    title: 'All applications,',
    italicWord: 'one dashboard.',
    description:
      'Track every application status, interview schedule, and job offer without messy spreadsheets.',
    bgImage: '/images/image-3.webp',
  },
  {
    id: 4,
    number: '04',
    title: 'AI-powered',
    italicWord: 'every step of the way.',
    description:
      'ATS optimization, high-impact action verbs, and smart recommendations to make your CV stand out.',
    bgImage: '/images/image-4.webp',
  },
];

export default function WhyEmployr() {
  const [activeId, setActiveId] = useState<number | null>(1);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!isMobile || !section || !track) return;

    let anim: gsap.core.Tween | undefined;

    // Small delay to ensure all nested artifact images/DOM sizes are measured correctly
    const timer = setTimeout(() => {
      const getScrollDistance = () => {
        const lastCard = track.lastElementChild as HTMLElement | null;
        if (!lastCard) return Math.max(0, track.scrollWidth - window.innerWidth);
        const rightEdge = track.offsetLeft + lastCard.offsetLeft + lastCard.offsetWidth + 20;
        return Math.max(0, rightEdge - window.innerWidth);
      };

      anim = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top+=20',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.4,
          invalidateOnRefresh: true,
          refreshPriority: 2,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const cardIdx = Math.min(3, Math.floor(p * 4));
            setActiveId(cardIdx + 1);
          },
        },
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      anim?.scrollTrigger?.kill();
      anim?.kill();
    };
  }, []);

  const handleTrackMouseLeave = () => {
    if (!window.matchMedia('(max-width: 900px)').matches) {
      setActiveId(null);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="why-employr why-employr--dark section-space"
      id="why-employr"
      aria-label="Why Employr"
    >
      <div className="editorial-frame why-employr__container">
        {/* TOP EDITORIAL HEADER */}
        <div className="why-employr__top">
          <div className="why-employr__header-left">
            <div className="section-label section-label--inverse">
              <span>02</span>
              <i className="section-label__line"></i>
              <span>WHY EMPLOYR</span>
            </div>
            <h2 className="why-employr__headline">
              A real partner,<br />
              not just a <em>form to fill.</em>
            </h2>
          </div>
          <div className="why-employr__header-right">
            <p className="why-employr__supporting">
              More than just a CV editor. Employr organizes your whole job hunt: build multi-version resumes, tailor each one to the job, track everything in Tracker, and get AI help at every stage.
            </p>
          </div>
        </div>

        {/* 4 CARDS TRACK */}
        <div
          ref={trackRef}
          className="why-employr__cards-track"
          onMouseLeave={handleTrackMouseLeave}
        >
          {cards.map((card) => {
            const isActive = activeId === card.id;

            return (
              <div
                key={card.id}
                data-card-id={card.id}
                className={`why-employr__card ${isActive ? 'is-active' : activeId !== null ? 'is-inactive' : 'is-default'}`}
                onMouseEnter={() => setActiveId(card.id)}
                onMouseLeave={() => setActiveId(null)}
                onClick={() => setActiveId(activeId === card.id ? null : card.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
              >
                {/* FULL-BLEED BACKGROUND IMAGE FOR ENTIRE CARD */}
                <div className="why-employr__card-bg">
                  <img
                    src={card.bgImage}
                    alt={`${card.title} ${card.italicWord || ''}`}
                    className="why-employr__card-img"
                    loading="lazy"
                  />
                  <div className="why-employr__card-shade"></div>
                </div>

                {/* CARD CONTENT LAYER */}
                <div className="why-employr__card-content">
                  {/* TOPLINE WITH NUMBER */}
                  <div className="why-employr__card-topline">
                    <span className="why-employr__card-num">{card.number}</span>
                  </div>

                  {/* GLOSSY FROSTED GLASS INNER BOX (REVEALS ON HOVER) */}
                  <div className="why-employr__glossy-glass-box">
                    <div className="why-employr__glass-top-shine"></div>
                    <div className="why-employr__glass-glare"></div>

                    <div className="why-employr__glass-content">
                      {/* CARD 01: EDITORIAL CV ARTIFACT */}
                      {card.id === 1 && (
                        <article className="lp-artifact-card">
                          <div className="lp-artifact-top">
                            <div className="lp-artifact-id">
                              <span className="lp-avatar">MS</span>
                              <div>
                                <b className="lp-name">Maria Syafira</b>
                                <small className="lp-sub">Product Designer</small>
                              </div>
                            </div>
                            <div className="lp-meta-box">
                              <span>CV / 01</span>
                              <b>ATS 92%</b>
                            </div>
                          </div>

                          <div className="lp-rule"></div>

                          <div className="lp-artifact-body">
                            <p className="lp-kicker">PROFILE & SKILLS</p>
                            <p className="lp-summary">Designing measurable digital experiences and clear product interfaces.</p>
                            <div className="lp-tags">
                              <span>UI/UX</span>
                              <span>Figma</span>
                              <span>Design System</span>
                              <span>React</span>
                            </div>
                          </div>

                          <div className="lp-artifact-footer">
                            <span className="lp-note">Modern ATS Standard</span>
                            <span className="lp-action-badge">Ready to Apply</span>
                          </div>
                        </article>
                      )}

                      {/* CARD 02: KECOCOKAN LOWONGAN */}
                      {card.id === 2 && (
                        <article className="lp-artifact-card">
                          <div className="lp-artifact-top">
                            <div>
                              <p className="lp-kicker">ROLE ALIGNMENT</p>
                              <b className="lp-name">Frontend Engineer</b>
                              <small className="lp-sub">at GoTo Jakarta</small>
                            </div>
                            <div className="lp-score-box">
                              <b>95</b>
                              <small>% MATCH</small>
                            </div>
                          </div>

                          <div className="lp-rule"></div>

                          <div className="lp-artifact-body">
                            <div className="lp-stat-row">
                              <span>Technical Skills</span>
                              <b>96%</b>
                            </div>
                            <div className="lp-stat-row">
                              <span>Relevant Experience</span>
                              <b>94%</b>
                            </div>
                            <div className="lp-tags">
                              <span className="lp-tag-matched">Next.js 15</span>
                              <span className="lp-tag-matched">TypeScript</span>
                              <span className="lp-tag-matched">Tailwind</span>
                            </div>
                          </div>

                          <div className="lp-artifact-footer">
                            <span className="lp-note">CV tailored for this role</span>
                            <span className="lp-action-badge">High Match</span>
                          </div>
                        </article>
                      )}

                      {/* CARD 03: KANBAN TRACKER */}
                      {card.id === 3 && (
                        <article className="lp-artifact-card">
                          <div className="lp-artifact-top">
                            <div>
                              <p className="lp-kicker">APPLICATION TRACKING</p>
                              <b className="lp-name">Career Tracker</b>
                              <small className="lp-sub">6 Active Applications</small>
                            </div>
                            <span className="lp-pill-blue">Active</span>
                          </div>

                          <div className="lp-rule"></div>

                          <div className="lp-kanban-cols">
                            <div className="lp-kanban-col">
                              <span className="lp-col-head">SENT</span>
                              <b>Traveloka</b>
                              <small>Frontend</small>
                            </div>
                            <div className="lp-kanban-col lp-col--active">
                              <span className="lp-col-head">INTERVIEW</span>
                              <b>Tokopedia</b>
                              <small>Tomorrow 2 PM</small>
                            </div>
                            <div className="lp-kanban-col lp-col--success">
                              <span className="lp-col-head">OFFERING</span>
                              <b>Astra Tech</b>
                              <small>Final Stage</small>
                            </div>
                          </div>

                          <div className="lp-artifact-footer">
                            <span className="lp-note">Schedule synced</span>
                            <span className="lp-action-badge">Real-Time Update</span>
                          </div>
                        </article>
                      )}

                      {/* CARD 04: OPTIMASI AI */}
                      {card.id === 4 && (
                        <article className="lp-artifact-card">
                          <div className="lp-artifact-top">
                            <div>
                              <p className="lp-kicker">PHRASE OPTIMIZATION</p>
                              <b className="lp-name">High-Impact Wins</b>
                              <small className="lp-sub">Smart Assist</small>
                            </div>
                            <span className="lp-pill-lime">+38% Score</span>
                          </div>

                          <div className="lp-rule"></div>

                          <div className="lp-diff-box">
                            <div className="lp-diff-item">
                              <span className="lp-diff-kicker">FIRST DRAFT</span>
                              <p>"Built websites and fixed bugs."</p>
                            </div>
                            <div className="lp-diff-item lp-diff-item--ai">
                              <span className="lp-diff-kicker lp-diff-kicker--ai">OPTIMIZED</span>
                              <p>"Developed 12 React modules, improved load speed by 40% and conversion by 25%."</p>
                            </div>
                          </div>

                          <div className="lp-artifact-footer">
                            <span className="lp-note">Measurable action verbs</span>
                            <span className="lp-action-badge">Ready to Copy</span>
                          </div>
                        </article>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM HEADLINE & EXPANDABLE DESCRIPTION */}
                  <div className="why-employr__card-bottom">
                    <h3 className="why-employr__card-title">
                      {card.title} {card.italicWord && <em>{card.italicWord}</em>}
                    </h3>
                    <div className="why-employr__desc-wrap">
                      <p className="why-employr__card-desc">{card.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .why-employr--dark {
          background: #101010 !important;
          color: #ffffff !important;
          padding: 110px 0 100px;
          position: relative;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .why-employr__container {
          width: min(1380px, calc(100% - 64px));
          margin: 0 auto;
        }

        /* TOP EDITORIAL HEADER */
        .why-employr__top {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          align-items: flex-end;
          gap: 6vw;
          margin-bottom: 44px;
        }

        .why-employr__header-left {
          display: flex;
          flex-direction: column;
        }

        .section-label--inverse {
          align-items: center;
          color: #9a9a95;
          display: flex;
          font-family: "Manrope", Arial, sans-serif;
          font-size: 9px;
          font-weight: 800;
          gap: 8px;
          letter-spacing: .14em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .section-label__line {
          background: #3B82F6;
          display: block;
          height: 1px;
          width: 48px;
        }

        .why-employr__headline {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: clamp(2.6rem, 4.4vw, 4.4rem);
          font-weight: 600;
          letter-spacing: -.085em;
          line-height: .92;
          color: #ffffff;
          margin: 0;
        }

        .why-employr__headline em {
          font-family: "Instrument Serif", Georgia, serif;
          font-style: italic;
          font-weight: 400;
          color: #ffffff;
        }

        .why-employr__header-right {
          padding-bottom: 6px;
        }

        .why-employr__supporting {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: 14.5px;
          line-height: 1.6;
          color: #b1b1ad;
          margin: 0;
          max-width: 420px;
        }

        /* 4 HORIZONTAL CARDS TRACK */
        .why-employr__cards-track {
          display: flex;
          gap: 16px;
          width: 100%;
          align-items: stretch;
          min-height: 390px;
        }

        /* CARD BASE: COMPACT 390PX */
        .why-employr__card {
          position: relative;
          height: 390px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: #141414;
          box-sizing: border-box;
          transition: flex-basis 0.65s cubic-bezier(0.22, 1, 0.36, 1),
                      flex-grow 0.65s cubic-bezier(0.22, 1, 0.36, 1),
                      border-color 0.45s ease,
                      box-shadow 0.45s ease,
                      transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* DEFAULT STATE */
        .why-employr__card.is-default {
          flex: 1 1 25%;
        }

        .why-employr__card.is-default:hover {
          border-color: rgba(255, 255, 255, 0.28);
        }

        /* INACTIVE STATE */
        .why-employr__card.is-inactive {
          flex: 1 1 18%;
          opacity: 0.85;
        }

        .why-employr__card.is-inactive:hover {
          border-color: rgba(255, 255, 255, 0.28);
          opacity: 1;
        }

        /* ACTIVE HOVERED CARD */
        .why-employr__card.is-active {
          flex: 2 1 38%;
          border-color: rgba(96, 165, 250, 0.85);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65), 0 0 20px rgba(59, 130, 246, 0.22);
          transform: translateY(-3px);
        }

        /* FULL-BLEED BACKGROUND IMAGE */
        .why-employr__card-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .why-employr__card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1),
                      filter 0.5s ease;
        }

        .why-employr__card.is-default .why-employr__card-img {
          filter: brightness(0.55) contrast(1.08);
          transform: scale(1);
        }

        .why-employr__card.is-inactive .why-employr__card-img {
          filter: brightness(0.38) grayscale(20%) contrast(1.05);
          transform: scale(1);
        }

        .why-employr__card.is-active .why-employr__card-img {
          filter: brightness(0.72) contrast(1.15);
          transform: scale(1.06);
        }

        .why-employr__card-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10, 10, 10, 0.55) 0%,
            rgba(10, 10, 10, 0.15) 35%,
            rgba(10, 10, 10, 0.82) 70%,
            rgba(10, 10, 10, 0.98) 100%
          );
          pointer-events: none;
        }

        /* CONTENT LAYER */
        .why-employr__card-content {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          padding: 16px 14px 18px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        /* TOP NUMBER */
        .why-employr__card-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .why-employr__card-num {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: clamp(34px, 3.2vw, 44px);
          font-weight: 800;
          letter-spacing: -.08em;
          line-height: .85;
          text-shadow: 0 4px 16px rgba(0,0,0,0.9);
          transition: color 0.3s ease, opacity 0.3s ease;
        }

        .why-employr__card.is-default .why-employr__card-num {
          color: #e2e8f0;
          opacity: 0.85;
        }

        .why-employr__card.is-inactive .why-employr__card-num {
          color: #94a3b8;
          opacity: 0.55;
        }

        .why-employr__card.is-active .why-employr__card-num {
          color: #ffffff;
          opacity: 1;
        }

        /* GLOSSY FROSTED GLASS INNER BOX */
        .why-employr__glossy-glass-box {
          position: relative;
          width: 100%;
          height: 175px;
          border-radius: 11px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.45),
                      0 10px 24px rgba(0, 0, 0, 0.4);
          margin-top: 2px;
          margin-bottom: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(12px) scale(0.95);
          pointer-events: none;
          transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
        }

        .why-employr__card.is-active .why-employr__glossy-glass-box {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.6),
                      0 14px 34px rgba(0, 0, 0, 0.55),
                      0 0 20px rgba(59, 130, 246, 0.25);
        }

        .why-employr__glass-top-shine {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 45%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.38) 0%,
            rgba(255, 255, 255, 0.1) 60%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .why-employr__glass-glare {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.35) 0%,
            rgba(255, 255, 255, 0.06) 40%,
            transparent 75%
          );
          pointer-events: none;
          z-index: 1;
        }

        .why-employr__glass-content {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ------------------------------------------------------------------ */
        /* LANDING PAGE ARTIFACT CARD DESIGN SYSTEM */
        /* ------------------------------------------------------------------ */
        .lp-artifact-card {
          background: #F5F6F2;
          color: #101114;
          border-radius: 8px;
          border: 1px solid rgba(16, 17, 20, 0.18);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
          width: 100%;
          max-width: 320px;
          padding: 9px 11px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          box-sizing: border-box;
          transform: scale(0.96);
          transition: transform 0.4s ease;
          font-family: "DM Sans", Arial, sans-serif;
        }

        .why-employr__card.is-active .lp-artifact-card {
          transform: scale(1);
        }

        .lp-artifact-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .lp-artifact-id {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .lp-avatar {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: #1738D1;
          color: #F5F6F2;
          font-size: 8px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.05em;
        }

        .lp-name {
          font-size: 10px;
          font-weight: 700;
          color: #101114;
          display: block;
          line-height: 1.15;
        }

        .lp-sub {
          font-size: 7px;
          color: #616260;
          font-family: "Instrument Serif", Georgia, serif;
          font-style: italic;
          display: block;
        }

        .lp-meta-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
        }

        .lp-meta-box span {
          font-size: 6.5px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #616260;
        }

        .lp-meta-box b {
          font-size: 8px;
          font-weight: 800;
          color: #059669;
          background: #e6f9ed;
          padding: 1px 5px;
          border-radius: 999px;
          border: 1px solid #bbf7d0;
        }

        .lp-score-box {
          display: flex;
          align-items: baseline;
          gap: 2px;
          background: #101114;
          color: #C8F55B;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .lp-score-box b {
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
        }

        .lp-score-box small {
          font-size: 6px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .lp-pill-blue {
          font-size: 7px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: #C9D0FF;
          color: #1738D1;
          padding: 1.5px 6px;
          border-radius: 999px;
        }

        .lp-pill-lime {
          font-size: 7.5px;
          font-weight: 800;
          background: #C8F55B;
          color: #101114;
          padding: 1.5px 6px;
          border-radius: 999px;
          border: 1px solid #a3e635;
        }

        .lp-rule {
          height: 1px;
          background: rgba(16, 17, 20, 0.12);
          width: 100%;
          margin: 1px 0;
        }

        .lp-kicker {
          font-size: 6.5px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #616260;
          margin: 0;
        }

        .lp-artifact-body {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .lp-summary {
          font-size: 7px;
          line-height: 1.35;
          color: #3b3c36;
          margin: 0;
        }

        .lp-tags {
          display: flex;
          align-items: center;
          gap: 3px;
          flex-wrap: wrap;
          margin-top: 1px;
        }

        .lp-tags span {
          font-size: 6.5px;
          font-weight: 700;
          background: #FFFFFF;
          color: #101114;
          border: 1px solid rgba(16, 17, 20, 0.15);
          padding: 1px 5px;
          border-radius: 999px;
        }

        .lp-tag-matched {
          background: #ecfdf5 !important;
          color: #059669 !important;
          border-color: #a7f3d0 !important;
        }

        .lp-stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 7px;
          color: #3b3c36;
          font-weight: 600;
        }

        .lp-stat-row b {
          color: #101114;
        }

        /* MINI KANBAN */
        .lp-kanban-cols {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
        }

        .lp-kanban-col {
          background: #FFFFFF;
          border: 1px solid rgba(16, 17, 20, 0.12);
          border-radius: 4px;
          padding: 3px 4px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .lp-col-head {
          font-size: 5.5px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #616260;
        }

        .lp-kanban-col b {
          font-size: 6.5px;
          color: #101114;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lp-kanban-col small {
          font-size: 5.5px;
          color: #616260;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lp-col--active {
          border-color: #1738D1;
          background: #f4f6ff;
        }

        .lp-col--active .lp-col-head {
          color: #1738D1;
        }

        .lp-col--success {
          border-color: #059669;
          background: #f0fdf4;
        }

        .lp-col--success .lp-col-head {
          color: #059669;
        }

        /* DIFF AI */
        .lp-diff-box {
          display: flex;
          flex-direction: column;
          gap: 2.5px;
        }

        .lp-diff-item {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .lp-diff-kicker {
          font-size: 5.5px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #616260;
        }

        .lp-diff-item p {
          font-size: 6.5px;
          line-height: 1.25;
          color: #616260;
          margin: 0;
        }

        .lp-diff-item--ai {
          background: #FFFFFF;
          border: 1px solid rgba(16, 17, 20, 0.15);
          border-left: 2px solid #1738D1;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .lp-diff-kicker--ai {
          color: #1738D1;
        }

        .lp-diff-item--ai p {
          color: #101114;
          font-weight: 600;
        }

        /* FOOTER ACTIONS */
        .lp-artifact-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2px;
          border-top: 1px solid rgba(16, 17, 20, 0.08);
          margin-top: 1px;
        }

        .lp-note {
          font-size: 6.5px;
          color: #616260;
          font-weight: 600;
        }

        .lp-action-badge {
          font-size: 6.5px;
          font-weight: 800;
          color: #1738D1;
          background: #C9D0FF;
          padding: 1.5px 6px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* BOTTOM CARD TITLE & DESC */
        .why-employr__card-bottom {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 10px;
        }

        .why-employr__card-title {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: clamp(17px, 1.6vw, 20px);
          font-weight: 700;
          letter-spacing: -.06em;
          line-height: 1.1;
          color: #ffffff;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        }

        .why-employr__card-title em {
          font-family: "Instrument Serif", Georgia, serif;
          font-style: italic;
          font-weight: 400;
          color: #ffffff;
        }

        .why-employr__desc-wrap {
          overflow: hidden;
          transition: max-height 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .why-employr__card:not(.is-active) .why-employr__desc-wrap {
          max-height: 0;
          opacity: 0;
        }

        .why-employr__card.is-active .why-employr__desc-wrap {
          max-height: 90px;
          opacity: 1;
        }

        .why-employr__card-desc {
          font-family: "DM Sans", Arial, sans-serif;
          font-size: 12px;
          line-height: 1.45;
          color: #cbd5e1;
          margin: 0;
        }

        /* RESPONSIVE: GSAP scroll-pinned horizontal cards */
        @media (max-width: 900px) {
          .why-employr--dark {
            padding: 85px 0 75px;
            overflow: hidden !important;
            width: 100% !important;
          }

          .why-employr__top {
            grid-template-columns: 1fr;
            gap: 18px;
            margin-bottom: 30px;
          }

          .why-employr__cards-track {
            display: flex !important;
            flex-direction: row !important;
            gap: 16px;
            overflow: visible !important;
            padding: 8px 16px 26px;
            margin: 0;
            min-height: 0;
            align-items: stretch;
            will-change: transform;
            width: max-content !important;
          }

          .why-employr__cards-track::-webkit-scrollbar {
            display: none;
          }

          .why-employr__card {
            flex: 0 0 min(82vw, 330px) !important;
            height: 380px;
            min-height: 0;
            transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          }

          /* DEFAULT & INACTIVE: dimmed, compact like unhovered desktop */
          .why-employr__card.is-default,
          .why-employr__card.is-inactive {
            opacity: 0.55;
            border-color: rgba(255, 255, 255, 0.12);
            box-shadow: none;
          }

          .why-employr__card.is-default .why-employr__glossy-glass-box,
          .why-employr__card.is-inactive .why-employr__glossy-glass-box {
            opacity: 0;
            transform: translateY(12px) scale(0.95);
            pointer-events: none;
          }

          .why-employr__card.is-default .why-employr__desc-wrap,
          .why-employr__card.is-inactive .why-employr__desc-wrap {
            max-height: 0;
            opacity: 0;
          }

          /* ACTIVE: highlighted, glass box reveals, description open */
          .why-employr__card.is-active {
            opacity: 1;
            border-color: rgba(96, 165, 250, 0.85);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.22);
            transform: translateY(-2px);
          }

          .why-employr__card.is-active .why-employr__glossy-glass-box {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.4);
          }

          .why-employr__card.is-active .why-employr__desc-wrap {
            max-height: 90px;
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
