import Image from 'next/image';
import { ReactNode } from 'react';

interface MascotEmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MascotEmptyState({
  title,
  description,
  action,
  badge,
  size = 'md',
  className = '',
}: MascotEmptyStateProps) {
  const imageDimensions = {
    sm: { width: 96, height: 96, className: 'w-24 h-24' },
    md: { width: 128, height: 128, className: 'w-28 h-28 sm:w-32 sm:h-32' },
    lg: { width: 160, height: 160, className: 'w-32 h-32 sm:w-40 sm:h-40' },
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 sm:p-8 text-center max-w-sm mx-auto select-none ${className}`}
    >
      <div
        className={`relative ${imageDimensions.className} mb-3.5 select-none pointer-events-none drop-shadow-xs`}
      >
        <Image
          src="/images/mascot-search-owl.webp"
          alt=""
          aria-hidden="true"
          width={imageDimensions.width}
          height={imageDimensions.height}
          className="object-contain w-full h-full"
          priority={false}
        />
      </div>

      {badge && (
        <span className="inline-block px-2.5 py-0.5 rounded-[10px] text-caption font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 mb-2">
          {badge}
        </span>
      )}

      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 max-w-xs">
        {description}
      </p>

      {action && (
        <div className="flex items-center justify-center gap-2 pt-0.5">
          {action}
        </div>
      )}
    </div>
  );
}
