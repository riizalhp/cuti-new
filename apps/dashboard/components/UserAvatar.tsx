'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Avatar from 'boring-avatars';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  name?: string | null;
  photoUrl?: string | null;
  size?: number;
  className?: string;
  variant?: 'beam' | 'marble' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';
  square?: boolean;
  colors?: string[];
  alt?: string;
}

export const BRAND_AVATAR_COLORS = [
  '#1738D1', // Cobalt (Primary)
  '#1F3578', // Navy
  '#F97316', // Orange Accent
  '#C8F55B', // Lime Accent
  '#C9D0FF', // Periwinkle
];

export function UserAvatar({
  name,
  photoUrl,
  size = 36,
  className = '',
  variant = 'beam',
  square = false,
  colors = BRAND_AVATAR_COLORS,
  alt,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const displayName = name?.trim() || 'Employr User';

  // If photoUrl is available and has not errored
  if (photoUrl && !imgError) {
    return (
      <Image
        src={photoUrl}
        alt={alt || displayName}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={cn(
          'object-cover shrink-0',
          square ? 'rounded-[10px]' : 'rounded-full',
          className
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback to Boring Avatars (SVG generated client-side with Brand Palette)
  return (
    <div
      className={cn(
        'shrink-0 overflow-hidden flex items-center justify-center select-none',
        square ? 'rounded-[10px]' : 'rounded-full',
        className
      )}
      style={{ width: size, height: size }}
      title={displayName}
      aria-label={displayName}
    >
      <Avatar
        size={size}
        name={displayName}
        variant={variant}
        colors={colors}
        square={square}
      />
    </div>
  );
}

export default UserAvatar;
