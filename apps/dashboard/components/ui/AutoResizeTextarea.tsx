'use client';

import React, { useRef, useEffect, useCallback } from 'react';

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(
  (
    {
      className,
      value,
      onChange,
      onInput,
      rows = 3,
      minHeight = 60,
      maxHeight = 600,
      style,
      ...props
    },
    ref
  ) => {
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    const adjustHeight = useCallback(() => {
      const el =
        ref && typeof ref === 'object' && 'current' in ref && ref.current
          ? ref.current
          : localRef.current;
      if (el) {
        el.style.height = 'auto';
        const targetHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
        el.style.height = `${targetHeight}px`;
      }
    }, [ref, minHeight, maxHeight]);

    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    return (
      <textarea
        ref={(node) => {
          localRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref && typeof ref === 'object' && 'current' in ref) {
            (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          }
        }}
        value={value}
        rows={rows}
        onChange={(e) => {
          adjustHeight();
          if (onChange) onChange(e);
        }}
        onInput={(e) => {
          adjustHeight();
          if (onInput) onInput(e);
        }}
        className={`w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] transition-all leading-relaxed shadow-2xs resize-none overflow-hidden ${className || ''}`}
        style={{ ...style }}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
