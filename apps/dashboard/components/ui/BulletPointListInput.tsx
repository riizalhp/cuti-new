'use client';

import React, { useRef, useEffect } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { parseCleanBulletLines, cleanBulletLine } from '@/lib/cv-bullets';

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
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Parse string into array of lines without bullet markers
  const rawLines = value ? parseCleanBulletLines(value) : [''];
  const lines = rawLines.length > 0 ? rawLines : [''];

  // Auto resize height for all textareas based on content
  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(36, el.scrollHeight)}px`;
  };

  useEffect(() => {
    textareaRefs.current.forEach((el) => adjustHeight(el));
  }, [value]);

  const handleLineChange = (index: number, newText: string) => {
    // Replace newline within same line to keep bullet structure intact
    // and clean accidental leading bullet markers if typed
    const singleLine = newText.replace(/[\r\n]+/g, ' ');
    const sanitized = cleanBulletLine(singleLine);
    const updated = [...lines];
    updated[index] = sanitized;
    onChange(updated.join('\n'));
    adjustHeight(textareaRefs.current[index]);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, index: number) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData) return;

    const parsedLines = parseCleanBulletLines(pasteData);
    if (parsedLines.length > 1) {
      e.preventDefault();
      const updated = [...lines];
      updated.splice(index, 1, ...parsedLines);
      onChange(updated.join('\n'));
    } else if (parsedLines.length === 1) {
      const cleaned = cleanBulletLine(pasteData);
      if (cleaned !== pasteData.trim()) {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = textarea.value;
        const newVal = currentVal.substring(0, start) + cleaned + currentVal.substring(end);
        handleLineChange(index, newVal);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Insert new line after current
      const updated = [...lines];
      updated.splice(index + 1, 0, '');
      onChange(updated.join('\n'));
      setTimeout(() => {
        textareaRefs.current[index + 1]?.focus();
      }, 0);
    } else if (e.key === 'Backspace' && lines[index] === '' && lines.length > 1) {
      e.preventDefault();
      // Remove this line and focus previous
      const updated = lines.filter((_, i) => i !== index);
      onChange(updated.join('\n'));
      setTimeout(() => {
        textareaRefs.current[Math.max(0, index - 1)]?.focus();
      }, 0);
    }
  };

  const handleAddLine = () => {
    const updated = [...lines, ''];
    onChange(updated.join('\n'));
    setTimeout(() => {
      textareaRefs.current[updated.length - 1]?.focus();
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
      textareaRefs.current[Math.max(0, index - 1)]?.focus();
    }, 0);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="font-semibold text-slate-700 dark:text-slate-300 block text-xs mb-2">
          {label}
        </label>
      )}

      {/* Container garis-garis input */}
      <div className="rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className="group relative flex items-start border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors focus-within:ring-2 focus-within:ring-cobalt-500 focus-within:ring-inset"
          >
            {/* Bullet dot */}
            <div className="pl-3.5 pr-2 pt-3 flex items-center shrink-0">
              <div className="w-[5px] h-[5px] rounded-full bg-slate-400 dark:bg-slate-500 group-focus-within:bg-cobalt-500 transition-colors" />
            </div>

            {/* Textarea — Otomatis tinggi menyesuaikan isi (selalu terlihat utuh) */}
            <textarea
              ref={(el) => {
                textareaRefs.current[idx] = el;
                adjustHeight(el);
              }}
              rows={1}
              value={line}
              onChange={(e) => handleLineChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={(e) => handlePaste(e, idx)}
              placeholder={idx === 0 ? placeholder : `Poin ke-${idx + 1}...`}
              className="w-full py-2.5 pl-0 pr-16 bg-transparent text-slate-800 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none leading-relaxed resize-none overflow-hidden min-h-[36px]"
            />

            {/* Action buttons (Overlay di sebelah kanan saat hover / focus) */}
            <div className="absolute right-2 top-2 flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-1 py-0.5 rounded-[8px] z-10 shadow-2xs border border-slate-200/60 dark:border-slate-700/60 sm:border-transparent">
              {/* Quick action: Optimalkan Bullet (Icon only) */}
              {onOptimizeBullet && line.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => onOptimizeBullet(line, idx)}
                  className="p-1 min-h-[28px] min-w-[28px] rounded-[6px] text-orange-700 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-950/60 transition cursor-pointer flex items-center justify-center dark:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  title="Optimalkan kalimat ini"
                  aria-label="Optimalkan kalimat ini"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-orange-500 text-orange-700 dark:text-orange-400" />
                </button>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemoveLine(idx)}
                className={`p-1 min-h-[28px] min-w-[28px] rounded-[6px] text-slate-500 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition cursor-pointer flex items-center justify-center ${
                  (lines.length > 1 || line) ? '' : 'pointer-events-none opacity-40'
                } dark:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500`}
                title="Hapus baris ini"
                aria-label="Hapus baris ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add line button */}
      <button
        type="button"
        onClick={handleAddLine}
        className="px-3 py-1.5 min-h-[32px] rounded-[10px] bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-400 font-bold text-xs border border-orange-200/80 dark:border-orange-800/60 transition flex items-center gap-1.5 cursor-pointer shadow-2xs mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Tambah Baris</span>
      </button>
    </div>
  );
};
