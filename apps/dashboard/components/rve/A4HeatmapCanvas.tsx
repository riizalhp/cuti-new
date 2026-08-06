'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CvParsedData,
  BoundingBox,
  FixationPoint,
  AtsCorrelationItem,
} from './RveEnginePipeline';
import { Sparkles } from 'lucide-react';

interface A4HeatmapCanvasProps {
  parsedData: CvParsedData;
  boundingBoxes: BoundingBox[];
  fixationPoints: FixationPoint[];
  atsCorrelations: AtsCorrelationItem[];
  viewMode: 'heatmap' | 'f-pattern' | 'bbox' | 'ats-matrix';
  showOverlay: boolean;
  targetLevel?: string;
}

interface TextDomPosition {
  id: string;
  label: string;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
}

export const A4HeatmapCanvas: React.FC<A4HeatmapCanvasProps> = ({
  parsedData,
  boundingBoxes,
  atsCorrelations,
  viewMode,
  showOverlay,
  targetLevel = 'Mid',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store calculated text DOM positions for F-Pattern SVG trajectory & badges
  const [domFixations, setDomFixations] = useState<TextDomPosition[]>([]);

  // Function to highlight metric numbers in achievements
  const renderAchievementWithMetrics = (text: string) => {
    // Match percentages, numbers with +, or multipliers like 35%, 12+, 40%, 50.000+
    const parts = text.split(/(\b\d+[\d.,]*%|\b\d+[\d.,]*\+|\b\d+\b)/g);
    return parts.map((part, i) => {
      const isMetric = /^\d+[\d.,]*%?$|^\d+[\d.,]*\+$/.test(part);
      if (isMetric) {
        return (
          <span
            key={i}
            data-heatmap="metric"
            data-heatmap-intensity="0.94"
            data-heatmap-label="Metrik & Angka Terukur"
            className="font-black text-rose-600 bg-rose-50 px-1 rounded border border-rose-200 inline-block my-0.5"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Re-calculate DOM bounding boxes and draw Canvas Heatmap aligned EXACTLY with text elements
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderHeatmap = () => {
      const containerRect = container.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;

      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);

      // Find all elements marked for heatmap targeting
      const heatmapElements = container.querySelectorAll<HTMLElement>('[data-heatmap]');
      const positions: TextDomPosition[] = [];

      let orderCount = 1;

      heatmapElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const relX = rect.left - containerRect.left;
        const relY = rect.top - containerRect.top;
        const relW = rect.width;
        const relH = rect.height;
        const intensity = parseFloat(el.getAttribute('data-heatmap-intensity') || '0.5');
        const label = el.getAttribute('data-heatmap-label') || el.innerText.substring(0, 20);
        const type = el.getAttribute('data-heatmap');

        if (relW > 0 && relH > 0) {
          positions.push({
            id: `dom-fp-${orderCount}`,
            label,
            order: orderCount++,
            x: relX,
            y: relY,
            width: relW,
            height: relH,
            intensity,
          });

          if (showOverlay && viewMode === 'heatmap') {
            // Draw gradient heatmap directly covering the text element geometry
            const centerY = relY + relH / 2;
            const dotSpacing = Math.max(16, Math.min(relW / 4, 30));
            const baseRadius = Math.max(relH * 1.4, 24);

            // Generate overlapping radial spots across the width of the text element
            for (let px = relX + 8; px <= relX + relW - 8; px += dotSpacing) {
              const radGrad = ctx.createRadialGradient(px, centerY, 0, px, centerY, baseRadius);

              if (intensity >= 0.88) {
                // Hotspot Red/Orange
                radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.72)');
                radGrad.addColorStop(0.45, 'rgba(249, 115, 22, 0.45)');
                radGrad.addColorStop(0.75, 'rgba(234, 179, 8, 0.2)');
                radGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
              } else if (intensity >= 0.75) {
                // Warm Yellow/Amber
                radGrad.addColorStop(0, 'rgba(245, 158, 11, 0.65)');
                radGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.35)');
                radGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
              } else if (intensity >= 0.45) {
                // Medium Green/Cyan
                radGrad.addColorStop(0, 'rgba(16, 185, 129, 0.55)');
                radGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
                radGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
              } else {
                // Cold Zone Blue
                radGrad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
                radGrad.addColorStop(0.7, 'rgba(148, 163, 184, 0.15)');
                radGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
              }

              ctx.fillStyle = radGrad;
              ctx.beginPath();
              ctx.arc(px, centerY, baseRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      });

      setDomFixations(positions);
    };

    renderHeatmap();

    // Re-render on container resize (sidebar collapse/expand), window resize or content change
    const resizeObserver = new ResizeObserver(() => {
      renderHeatmap();
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', renderHeatmap);
    const timeout = setTimeout(renderHeatmap, 100);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', renderHeatmap);
      clearTimeout(timeout);
    };
  }, [parsedData, viewMode, showOverlay]);

  return (
    <div className="relative w-full flex justify-center overflow-x-auto py-2">
      {/* Outer A4 Paper Container with Shadow & Border */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[650px] aspect-[1/1.414] bg-white text-slate-900 rounded-lg border border-slate-300 shadow-2xl overflow-hidden font-sans p-4 sm:p-7 md:p-9 flex flex-col justify-between select-none shrink-0"
        style={{ fontFamily: 'Inter, var(--font-inter), sans-serif' }}
      >
        {/* HTML5 Canvas Heatmap Overlay - Aligned 100% with DOM text elements */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 z-20 ${
            showOverlay && viewMode === 'heatmap' ? 'opacity-90 blur-[1px]' : 'opacity-0'
          }`}
        />

        {/* F-Pattern Reading Path Lines SVG Layer */}
        {showOverlay && viewMode === 'f-pattern' && domFixations.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            <defs>
              <linearGradient id="f-path-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#F97316" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <polyline
              points={domFixations
                .map((fp) => `${fp.x + fp.width / 2},${fp.y + fp.height / 2}`)
                .join(' ')}
              fill="none"
              stroke="url(#f-path-grad)"
              strokeWidth="3.5"
              strokeDasharray="6,4"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* 1. CV HEADER SECTION */}
        <div className="relative z-10 border-b border-slate-200 pb-4 space-y-1">
          <div className="flex justify-between items-start">
            <div>
              <h1
                data-heatmap="header-name"
                data-heatmap-intensity="0.96"
                data-heatmap-label="Nama Candidate"
                className="text-xl md:text-2xl font-black tracking-tight text-slate-900 inline-block"
              >
                {parsedData.candidateName}
              </h1>
              <div className="block mt-0.5">
                <span
                  data-heatmap="header-role"
                  data-heatmap-intensity="0.88"
                  data-heatmap-label="Gelar / Peran Pekerjaan"
                  className="text-xs md:text-sm font-bold text-navy-700 inline-block"
                >
                  {parsedData.roleTitle} • <span className="text-navy-500 font-semibold">{targetLevel} Level</span>
                </span>
              </div>
            </div>
            {showOverlay && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shadow-xs z-30">
                Hotspot #1 (96%)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 flex flex-wrap gap-3 pt-1">
            <span>📧 {parsedData.email}</span>
            <span>📞 {parsedData.phone}</span>
            <span>📍 {parsedData.location}</span>
          </p>
        </div>

        {/* 2. RINGKASAN PROFIL (SUMMARY) */}
        <div className="relative z-10 space-y-1.5 py-3 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-orange-500 pl-2">
              Ringkasan Profil (Executive Summary)
            </h2>
            {showOverlay && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 z-30">
                Focus 82%
              </span>
            )}
          </div>
          <p
            data-heatmap="summary"
            data-heatmap-intensity="0.82"
            data-heatmap-label="Teks Ringkasan Profil"
            className="text-xs text-slate-700 leading-relaxed font-normal inline-block"
          >
            {parsedData.summary}
          </p>
        </div>

        {/* 3. PENGALAMAN KERJA (EXPERIENCE) */}
        <div className="relative z-10 space-y-3 py-3 border-b border-slate-100 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-orange-500 pl-2">
              Pengalaman Kerja
            </h2>
            {showOverlay && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shadow-xs z-30">
                Hotspot #2 (94%)
              </span>
            )}
          </div>

          <div className="space-y-3">
            {parsedData.experience.map((exp) => (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline">
                  <span
                    data-heatmap="exp-title"
                    data-heatmap-intensity="0.94"
                    data-heatmap-label="Posisi & Perusahaan"
                    className="font-extrabold text-slate-900 inline-block"
                  >
                    {exp.role} — <span className="font-bold text-navy-700">{exp.company}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{exp.period}</span>
                </div>
                <ul className="list-disc list-inside text-slate-700 space-y-1 pl-1 text-[11px]">
                  {exp.achievements.map((ach, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {renderAchievementWithMetrics(ach)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 4. SKILLS & TECH STACK */}
        <div className="relative z-10 space-y-1.5 py-3 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-orange-500 pl-2">
              Keterampilan &amp; Tech Stack
            </h2>
            {showOverlay && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 z-30">
                Scan 78%
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {parsedData.skills.map((sk) => (
              <span
                key={sk}
                data-heatmap="skill-badge"
                data-heatmap-intensity="0.78"
                data-heatmap-label={`Skill: ${sk}`}
                className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 inline-block"
              >
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* 5. PENDIDIKAN & INFORMASI TAMBAHAN (COLD ZONE) */}
        <div className="relative z-10 space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-orange-500 pl-2">
              Pendidikan &amp; Kualifikasi
            </h2>
            {showOverlay && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500 text-white z-30">
                Cold Zone (22%)
              </span>
            )}
          </div>
          {parsedData.education.map((edu) => (
            <div
              key={edu.id}
              data-heatmap="education"
              data-heatmap-intensity="0.52"
              data-heatmap-label="Data Pendidikan"
              className="flex justify-between text-xs text-slate-700"
            >
              <span className="font-bold">{edu.degree} — {edu.institution}</span>
              <span className="text-slate-500 font-semibold">{edu.gpa}</span>
            </div>
          ))}
          <p
            data-heatmap="cold-zone"
            data-heatmap-intensity="0.22"
            data-heatmap-label="Informasi Tambahan / Cold Zone"
            className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 inline-block"
          >
            {parsedData.hobbiesAndMisc}
          </p>
        </div>

        {/* OVERLAY MODE: Bounded Boxes Wireframe */}
        {showOverlay && viewMode === 'bbox' && (
          <div className="absolute inset-0 pointer-events-none z-30 p-7 md:p-9">
            {boundingBoxes.map((box) => (
              <div
                key={box.id}
                style={{
                  top: `${box.y}%`,
                  left: `${box.x}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                className="absolute border-2 border-dashed border-orange-500/80 bg-orange-500/10 rounded flex items-start justify-end p-1"
              >
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-600 text-white shadow-xs">
                  {box.title} ({Math.round(box.visualWeight * 100)}% Weight)
                </span>
              </div>
            ))}
          </div>
        )}

        {/* OVERLAY MODE: Fixation Badges for F-Pattern */}
        {showOverlay && viewMode === 'f-pattern' && (
          <div className="absolute inset-0 pointer-events-none z-40">
            {domFixations.map((fp) => (
              <div
                key={fp.id}
                style={{
                  top: `${fp.y + fp.height / 2}px`,
                  left: `${fp.x + fp.width / 2}px`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5"
              >
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-lg ring-2 ring-rose-200 animate-bounce">
                  {fp.order}
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-white shadow-md">
                  {fp.label} ({Math.round(fp.intensity * 100)}%)
                </span>
              </div>
            ))}
          </div>
        )}

        {/* OVERLAY MODE: ATS Matrix Layer */}
        {showOverlay && viewMode === 'ats-matrix' && (
          <div className="absolute inset-0 pointer-events-none z-30 p-7 md:p-9 space-y-2 bg-slate-900/15 backdrop-blur-[0.5px]">
            <div className="p-3 bg-slate-900/90 text-white rounded-lg space-y-2 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-700 pb-1.5 font-extrabold text-orange-400">
                <Sparkles className="w-4 h-4" />
                <span>Analisis Korelasi Visibilitas Heatmap vs Kata Kunci ATS</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {atsCorrelations.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-1.5 rounded bg-slate-800 border border-slate-700 flex justify-between items-center"
                  >
                    <span className="font-semibold text-slate-200">{item.keyword}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        item.quadrant === 'gold' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {item.quadrant === 'gold' ? 'Area Emas' : 'Low ATS Keyword'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
