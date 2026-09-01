'use client';

import React, { useState, useEffect } from 'react';

export interface AuthReview {
  id: string | number;
  author: string;
  initials: string;
  title: string;
  body: string;
}

const DEFAULT_AUTH_REVIEWS: AuthReview[] = [
  {
    id: 1,
    author: 'Rian Pratama',
    initials: 'RP',
    title: 'Software Engineer di Tech Company',
    body: 'Employr bikin proses bikin CV dan tracking lamaran jadi jauh lebih cepat dan terstruktur. Diterima kerja dalam 3 minggu!',
  },
  {
    id: 2,
    author: 'Siti Rahmadani',
    initials: 'SR',
    title: 'Vocational Accounting Graduate · Surabaya',
    body: 'Fitur pelacak lamaran dan tips penyesuaian CV sangat membantu. Semua tahapan teratur rapi sampai dapat offering letter!',
  },
  {
    id: 3,
    author: 'Dimas Arya Nugraha',
    initials: 'DA',
    title: 'Final-Year Management Student · Yogyakarta',
    body: 'Bisa simpan beberapa versi CV tanpa repot copy-paste manual. Sangat praktis dan langsung lolos sortir awal!',
  },
  {
    id: 4,
    author: 'Aisyah Putri Maharani',
    initials: 'AP',
    title: 'Junior UI Designer · Jakarta',
    body: 'Tampilan PDF hasil cetaknya rapi dan terbaca sempurna di sistem ATS. Jauh lebih percaya diri melamar ke startup impian.',
  },
];

interface AuthReviewsCarouselProps {
  reviews?: AuthReview[];
  autoPlayInterval?: number;
  className?: string;
}

export const AuthReviewsCarousel: React.FC<AuthReviewsCarouselProps> = ({
  reviews = DEFAULT_AUTH_REVIEWS,
  autoPlayInterval = 4500,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = reviews.length;

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [total, isPaused, autoPlayInterval]);

  if (total === 0) return null;

  return (
    <div
      className={`relative z-10 w-full max-w-[360px] select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      style={{ height: '140px' }}
    >
      <div className="relative w-full h-[140px]">
        {reviews.map((review, index) => {
          const relIndex = (index - activeIndex + total) % total;
          const isCurrent = relIndex === 0;
          const isVisible = relIndex < 3;

          const yOffset = relIndex * 8;
          const scaleOffset = 1 - relIndex * 0.035;
          const zIndexVal = 20 - relIndex;
          const opacityVal = relIndex === 0 ? 1 : relIndex === 1 ? 0.75 : 0.45;

          return (
            <figure
              key={review.id}
              className={`absolute top-0 left-0 w-full bg-white rounded-[14px] p-4 text-slate-900 border border-slate-900/10 box-border ${
                isCurrent ? 'shadow-xl shadow-black/30 cursor-default' : 'shadow-md shadow-black/20 cursor-pointer'
              }`}
              style={{
                display: isVisible ? 'block' : 'none',
                transform: `translateY(${yOffset}px) scale(${scaleOffset})`,
                transformOrigin: 'top center',
                opacity: opacityVal,
                zIndex: zIndexVal,
                transition:
                  'transform 0.55s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.45s ease, box-shadow 0.3s ease, border-color 0.3s ease',
              }}
              onClick={() => {
                if (!isCurrent) setActiveIndex(index);
              }}
            >
              {/* Quote section */}
              <blockquote className="relative m-0 p-0">
                <span
                  className="absolute -top-3 -left-0.5 font-sans font-bold text-4xl leading-none text-[#1738D1]/20 select-none pointer-events-none"
                  aria-hidden="true"
                >
                  “
                </span>
                <p className="relative pt-0.5 font-sans text-xs font-medium text-[#222220] leading-relaxed line-clamp-2">
                  “{review.body}”
                </p>
              </blockquote>

              {/* Card footer */}
              <figcaption className="mt-2.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#1738D1] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {review.initials}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-bold text-[#101010] tracking-[-0.02em] leading-tight truncate">
                      {review.author}
                    </span>
                    <span className="text-[10px] font-medium text-[#706f6a] leading-tight truncate">
                      {review.title}
                    </span>
                  </div>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
};
