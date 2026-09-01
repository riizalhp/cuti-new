import { useState, useEffect, useMemo } from 'react';

export interface Review {
  id: string | number;
  author: string;
  title: string;
  body: string;
  roleBadge?: string;
}

export interface ReviewsCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  excludeIds?: (string | number)[];
  height?: string;
  reviews?: Review[];
  showIndicators?: boolean;
  showNavigation?: boolean;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    author: 'Rian Pratama',
    title: 'Computer Science Fresh Grad · Bandung',
    body: 'I used to get ghosted on applications. After using Employr action-verb tips and aligning my keywords with the job post, I landed my first interview in just two weeks.',
  },
  {
    id: 2,
    author: 'Siti Rahmadani',
    title: 'Vocational Accounting Graduate · Surabaya',
    body: 'The tracker feature was a lifesaver. I used to lose track of where I had applied. Now everything is neatly organized all the way through to my offer letter.',
  },
  {
    id: 3,
    author: 'Dimas Arya Nugraha',
    title: 'Final-Year Management Student · Yogyakarta',
    body: 'Being able to keep separate CV versions for internships and full-time jobs without messy copy-pasting is brilliant. Super practical!',
  },
  {
    id: 4,
    author: 'Aisyah Putri Maharani',
    title: 'Career Switcher / Junior UI Designer · Jakarta',
    body: 'The exported PDF is clean and reads perfectly on ATS parsers. I felt way more confident submitting my portfolio to my dream startup.',
  },
];

export default function ReviewsCarousel({
  reviews = DEFAULT_REVIEWS,
  className = '',
  height = '350px',
  excludeIds = [],
  showIndicators = true,
  showNavigation = true,
  autoPlay = true,
  autoPlayInterval = 5000,
}: ReviewsCarouselProps) {
  const filteredReviews = useMemo(() => {
    if (excludeIds.length === 0) return reviews;
    const excludeSet = new Set(excludeIds);
    return reviews.filter((r) => !excludeSet.has(r.id));
  }, [reviews, excludeIds]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = filteredReviews.length;

  // Auto-advance slides, paused while user hovers/touches
  useEffect(() => {
    if (!autoPlay || total <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, total, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  if (total === 0) return null;

  return (
    <div
      className={`reviews-carousel-root ${className}`}
      style={{ height }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Cards Display Stage */}
      <div className="reviews-carousel-stage">
        {filteredReviews.map((review, index) => {
          const relIndex = (index - activeIndex + total) % total;
          const isCurrent = relIndex === 0;
          const isVisible = relIndex < 3;

          const yOffset = relIndex * 16;
          const scaleOffset = 1 - relIndex * 0.05;
          const zIndexVal = 20 - relIndex;
          const opacityVal = relIndex === 0 ? 1 : relIndex === 1 ? 0.85 : 0.6;
          const blurVal = 0;

          return (
            <figure
              key={review.id}
              className={`reviews-card ${isCurrent ? 'is-active' : 'is-stacked is-clickable'}`}
              style={{
                display: isVisible ? 'block' : 'none',
                transform: `translateX(-50%) translateY(${yOffset}px) scale(${scaleOffset})`,
                opacity: opacityVal,
                filter: `blur(${blurVal}px)`,
                zIndex: zIndexVal,
                transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.45s ease, filter 0.45s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                cursor: isCurrent ? 'default' : 'pointer',
              }}
              onClick={() => {
                if (!isCurrent) setActiveIndex(index);
              }}
            >
              <blockquote className="reviews-card__quote">
                <div className="reviews-card__quote-mark">“</div>
                <p className="reviews-card__text">{review.body}</p>
              </blockquote>

              <figcaption className="reviews-card__footer">
                <div className="reviews-card__author-wrap">
                  <div className="reviews-card__avatar">
                    {review.author.charAt(0)}
                  </div>
                  <div className="reviews-card__meta">
                    <span className="reviews-card__author">{review.author}</span>
                    <span className="reviews-card__title">{review.title}</span>
                  </div>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="reviews-carousel-controls">
        {showNavigation && (
          <button
            aria-label="Previous Review"
            className="reviews-nav-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrev();
            }}
            type="button"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        {showIndicators && (
          <div className="reviews-indicators">
            {filteredReviews.map((review, index) => {
              const isDotActive = index === activeIndex;
              return (
                <button
                  aria-label={`Go to review ${index + 1}`}
                  className="reviews-dot-touch"
                  key={review.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveIndex(index);
                  }}
                  type="button"
                >
                  <span
                    className={`reviews-dot ${isDotActive ? 'is-active' : ''}`}
                  />
                </button>
              );
            })}
          </div>
        )}

        {showNavigation && (
          <button
            aria-label="Next Review"
            className="reviews-nav-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            type="button"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
