'use client';

import React, { useState } from 'react';
import { CompetencyScoreResult } from '@/lib/career-intelligence-engine';
import { cn } from '@/lib/utils';
import { ShieldCheck, Info } from 'lucide-react';

interface CompetencyRadarChartProps {
  competencies: CompetencyScoreResult[];
  onSelectCompetency?: (comp: CompetencyScoreResult) => void;
  className?: string;
}

export const CompetencyRadarChart: React.FC<CompetencyRadarChartProps> = ({
  competencies,
  onSelectCompetency,
  className,
}) => {
  const [activeCompId, setActiveCompId] = useState<string | null>(null);

  if (!competencies || competencies.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        Belum ada data kompetensi untuk divisualisasikan.
      </div>
    );
  }

  const size = 320;
  const center = size / 2;
  const radius = size * 0.38;
  const totalAxes = competencies.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Level grid rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Hitung koordinat polygon
  const getCoordinates = (value: number, index: number, max = 100) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (Math.min(100, Math.max(0, value)) / max) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Titik User (Current Score)
  const currentPoints = competencies.map((c, i) => getCoordinates(c.currentScore, i));
  const currentPolygonPoints = currentPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Titik Required Role
  const requiredPoints = competencies.map((c, i) => getCoordinates(c.requiredScore, i));
  const requiredPolygonPoints = requiredPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const activeComp = competencies.find((c) => c.id === activeCompId);

  return (
    <div className={cn('flex flex-col items-center select-none', className)}>
      {/* SVG Radar Visual */}
      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Grafik Radar Kompetensi"
        >
          {/* Circular/Polygon Background Rings */}
          {rings.map((ring, idx) => {
            const ringPoints = competencies
              .map((_, i) => getCoordinates(ring * 100, i))
              .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
              .join(' ');

            return (
              <polygon
                key={`ring-${idx}`}
                points={ringPoints}
                className="fill-none stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={idx === rings.length - 1 ? '1.5' : '1'}
              />
            );
          })}

          {/* Sumbu Axis Radial */}
          {competencies.map((comp, i) => {
            const end = getCoordinates(100, i);
            const isHovered = activeCompId === comp.id;

            return (
              <g key={`axis-${comp.id}`}>
                <line
                  x1={center}
                  y1={center}
                  x2={end.x}
                  y2={end.y}
                  className={cn(
                    'transition-colors duration-200',
                    isHovered
                      ? 'stroke-[#1738D1] dark:stroke-blue-400 stroke-2'
                      : 'stroke-slate-200 dark:stroke-slate-800 stroke-1'
                  )}
                />
              </g>
            );
          })}

          {/* Layer 1: Standar Kebutuhan Role (Abu-abu Putus-putus) */}
          <polygon
            points={requiredPolygonPoints}
            className="fill-slate-400/10 dark:fill-slate-500/10 stroke-slate-400 dark:stroke-slate-500"
            strokeWidth="1.75"
            strokeDasharray="4,4"
          />

          {/* Layer 2: Kemampuan Pengguna Saat Ini (Cobalt Blue Solid) */}
          <polygon
            points={currentPolygonPoints}
            className="fill-[#1738D1]/20 dark:fill-blue-500/25 stroke-[#1738D1] dark:stroke-blue-400"
            strokeWidth="2.5"
          />

          {/* Titik-titik interaktif Pengguna */}
          {currentPoints.map((pt, i) => {
            const comp = competencies[i];
            const isHovered = activeCompId === comp.id;

            return (
              <g
                key={`pt-${comp.id}`}
                className="cursor-pointer group"
                onClick={() => {
                  setActiveCompId(comp.id);
                  if (onSelectCompetency) onSelectCompetency(comp);
                }}
                onMouseEnter={() => setActiveCompId(comp.id)}
                onMouseLeave={() => setActiveCompId(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6.5 : 4.5}
                  className={cn(
                    'transition-all duration-200',
                    isHovered
                      ? 'fill-[#1738D1] dark:fill-blue-400 stroke-white dark:stroke-slate-900 stroke-2'
                      : 'fill-white dark:fill-slate-900 stroke-[#1738D1] dark:stroke-blue-400 stroke-2'
                  )}
                />
              </g>
            );
          })}

          {/* Label Sumbu di luar chart */}
          {competencies.map((comp, i) => {
            const labelCoord = getCoordinates(118, i);
            const isHovered = activeCompId === comp.id;
            const angle = i * angleStep - Math.PI / 2;
            const isLeft = Math.cos(angle) < -0.1;
            const isRight = Math.cos(angle) > 0.1;
            const textAnchor = isLeft ? 'end' : isRight ? 'start' : 'middle';

            // Pisahkan label panjang jika perlu
            const truncatedName = comp.name.length > 18 ? `${comp.name.slice(0, 16)}..` : comp.name;

            return (
              <text
                key={`label-${comp.id}`}
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor={textAnchor}
                className={cn(
                  'text-[10.5px] font-bold cursor-pointer transition-colors duration-150',
                  isHovered
                    ? 'fill-[#1738D1] dark:fill-blue-400 font-extrabold'
                    : 'fill-slate-600 dark:fill-slate-400'
                )}
                onClick={() => {
                  setActiveCompId(comp.id);
                  if (onSelectCompetency) onSelectCompetency(comp);
                }}
              >
                {truncatedName}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Floating Info Tooltip saat ada kompetensi yang aktif/dihover */}
      {activeComp && (
        <div className="mt-3 px-3.5 py-2 rounded-[10px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs shadow-md flex items-center gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>{activeComp.name}</span>
          </div>
          <div className="text-[11px] text-slate-300 dark:text-slate-700">
            Skor Anda: <strong className="text-white dark:text-slate-900">{activeComp.currentScore}</strong> / Standar: {activeComp.requiredScore}
          </div>
        </div>
      )}

      {/* Legend Keterangan */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 rounded-full bg-[#1738D1] dark:bg-blue-400 inline-block" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Profil Anda</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-0 border-t-2 border-dashed border-slate-400 dark:border-slate-500 inline-block" />
          <span className="text-slate-500 dark:text-slate-400">Standar Role Target</span>
        </div>
      </div>
    </div>
  );
};
