'use client';

import React, { useRef } from 'react';
import { Plus, Trash2, GripVertical, Sparkles } from 'lucide-react';

interface BulletPointListInputProps {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  onOptimizeBullet?: (bulletText: string, index: number) => void;
}

export const BulletPointListInput: React.FC<BulletPointListInputProps> = ({
  value = '',
  onChange,
  placeholder = 'Tuliskan deskripsi tugas / pencapaian...',
  label,
  onOptimizeBullet,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Parse string into array of lines (filter empty trailing but keep at least 1)
  const rawLines = value ? value.split('\n') : [''];
  const lines = rawLines.length > 0 ? rawLines : [''];

  const handleLineChange = (index: number, newText: string) => {
    const updated = [...lines];
    updated[index] = newText;
    onChange(updated.join('\n'));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Insert new line after current
      const updated = [...lines];
      updated.splice(index + 1, 0, '');
      onChange(updated.join('\n'));
      // Focus next input after re-render
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    } else if (e.key === 'Backspace' && lines[index] === '' && lines.length > 1) {
      e.preventDefault();
      // Remove this line and focus previous
      const updated = lines.filter((_, i) => i !== index);
      onChange(updated.join('\n'));
      setTimeout(() => {
        inputRefs.current[Math.max(0, index - 1)]?.focus();
      }, 0);
    }
  };

  const handleAddLine = () => {
    const updated = [...lines, ''];
    onChange(updated.join('\n'));
    setTimeout(() => {
      inputRefs.current[updated.length - 1]?.focus();
    }, 0);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) {
      onChange('');
      return;
    }
    const updated = lines.filter((_, i) => i !== index);
    onChange(updated.join('\n'));
    setTimeout(() => {
      inputRefs.current[Math.max(0, index - 1)]?.focus();
    }, 0);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="font-semibold text-slate-700 dark:text-slate-300 block text-xs mb-2">
          {label}
        </label>
      )}

      {/* A4-paper-like lines container */}
      <div className="rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`group flex items-center gap-0 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors`}
          >
            {/* Bullet dot */}
            <div className="pl-3.5 pr-2 py-2.5 flex items-center shrink-0">
              <div className="w-[5px] h-[5px] rounded-full bg-slate-400 dark:bg-slate-500 group-focus-within:bg-orange-500 transition-colors" />
            </div>

            {/* Input — full width, no border, mimics a paper line */}
            <input
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              value={line}
              onChange={(e) => handleLineChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              placeholder={idx === 0 ? placeholder : `Poin ke-${idx + 1}...`}
              className="flex-1 py-2.5 pr-2 bg-transparent text-slate-800 dark:text-white text-xs placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none leading-relaxed"
            />

            {/* Quick action: ✨ Optimalkan Bullet dengan AI */}
            {onOptimizeBullet && line.trim().length > 0 && (
              <button
                type="button"
                onClick={() => onOptimizeBullet(line, idx)}
                className="px-2 py-1 mr-1 text-[10px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 rounded-[10px] transition shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex items-center gap-1"
                title="Optimalkan bullet ini dengan AI"
                tabIndex={-1}
              >
                <Sparkles className="w-3 h-3 fill-purple-600 text-purple-600" />
                <span>Optimalkan</span>
              </button>
            )}

            {/* Delete button — hanya muncul saat hover/ada isi */}
            <button
              type="button"
              onClick={() => handleRemoveLine(idx)}
              className={`p-2 mr-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-[10px] transition shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 ${
                (lines.length > 1 || line) ? '' : 'pointer-events-none'
              }`}
              title="Hapus baris ini"
              tabIndex={-1}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add line button */}
      <button
        type="button"
        onClick={handleAddLine}
        className="px-3 py-1.5 rounded-[10px] bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-400 font-bold text-xs border border-orange-200/80 dark:border-orange-800/60 transition flex items-center gap-1.5 cursor-pointer shadow-2xs mt-1"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Tambah Baris</span>
      </button>
    </div>
  );
};
